/**
 * Automated Billing Engine
 * Handles: invoice generation, SEPA remittances, overdue management,
 * CDR rating, and payment reminders.
 */
import prisma from "./db";
import { sendInvoiceEmail, sendPaymentReminder, sendOverdueNotice } from "./email";
import { addDays, format, differenceInDays, startOfMonth, endOfMonth } from "date-fns";

// ─── GENERATE MONTHLY INVOICES ────────────────────────────────
export async function generateMonthlyInvoices(period?: string) {
  const billingConfig = await prisma.billingConfig.findFirst();
  if (!billingConfig) throw new Error("Billing config not found");

  const targetPeriod = period || format(new Date(), "yyyy-MM");
  const issueDate = new Date();
  const dueDate = addDays(issueDate, billingConfig.dueDays);

  // Get all active clients with services
  const clients = await prisma.client.findMany({
    where: { status: "ACTIVE" },
    include: {
      services: {
        where: { status: "ACTIVE" },
        include: { plan: true },
      },
    },
  });

  // Check for existing invoices this period
  const existingInvoices = await prisma.invoice.findMany({
    where: { period: targetPeriod },
    select: { clientId: true },
  });
  const alreadyBilled = new Set(existingInvoices.map((i) => i.clientId));

  const results = { created: 0, skipped: 0, errors: 0, totalAmount: 0 };
  let invoiceCounter = await getNextInvoiceNumber(billingConfig.series, targetPeriod);

  for (const client of clients) {
    if (alreadyBilled.has(client.id)) {
      results.skipped++;
      continue;
    }

    try {
      // Calculate base amount from active services
      const baseAmount = client.services.reduce((sum, svc) => sum + svc.plan.price, 0);
      if (baseAmount <= 0) continue;

      // Get CDR extras for this period (rated calls outside tariff)
      const extras = await calculateCDRExtras(client.id, targetPeriod);

      const subtotal = baseAmount + extras;
      const taxAmount = Math.round(subtotal * (billingConfig.taxRate / 100) * 100) / 100;
      const total = Math.round((subtotal + taxAmount) * 100) / 100;

      const invoiceNumber = `FAC-${targetPeriod.replace("-", "")}-${String(invoiceCounter++).padStart(6, "0")}`;

      const invoice = await prisma.invoice.create({
        data: {
          number: invoiceNumber,
          series: billingConfig.series,
          clientId: client.id,
          period: targetPeriod,
          issueDate,
          dueDate,
          concept: client.services.map((s) => s.plan.name).join(" + "),
          baseAmount,
          extras,
          subtotal,
          taxRate: billingConfig.taxRate,
          taxAmount,
          total,
          status: "ISSUED",
          paymentMethod: client.paymentMethod,
          iban: client.iban,
          items: {
            create: [
              ...client.services.map((svc) => ({
                concept: svc.plan.name,
                quantity: 1,
                unitPrice: svc.plan.price,
                total: svc.plan.price,
              })),
              ...(extras > 0
                ? [{ concept: "Consumo extra (fuera de tarifa)", quantity: 1, unitPrice: extras, total: extras }]
                : []),
            ],
          },
        },
      });

      // Send invoice email if enabled
      if (billingConfig.autoSendEmail) {
        await sendInvoiceEmail({
          id: invoice.id,
          number: invoice.number,
          clientName: client.name,
          clientEmail: client.email,
          period: targetPeriod,
          total: invoice.total,
          dueDate: format(dueDate, "dd/MM/yyyy"),
          concept: invoice.concept,
        });

        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: "SENT", sentAt: new Date() },
        });
      }

      results.created++;
      results.totalAmount += total;

      // Audit log
      await prisma.auditLog.create({
        data: {
          action: "INVOICE_GENERATED",
          entity: "Invoice",
          entityId: invoice.id,
          details: JSON.stringify({ number: invoiceNumber, total, clientId: client.id }),
        },
      });
    } catch (error) {
      console.error(`[Billing] Error creating invoice for ${client.id}:`, error);
      results.errors++;
    }
  }

  // Update last run timestamp
  await prisma.billingConfig.update({
    where: { id: billingConfig.id },
    data: { lastRunAt: new Date() },
  });

  return results;
}

// ─── CDR EXTRAS CALCULATION ───────────────────────────────────
async function calculateCDRExtras(clientId: string, period: string): Promise<number> {
  const [year, month] = period.split("-").map(Number);
  const from = startOfMonth(new Date(year, month - 1));
  const to = endOfMonth(new Date(year, month - 1));

  const cdrs = await prisma.cDR.findMany({
    where: {
      clientId,
      dateTime: { gte: from, lte: to },
      cost: { gt: 0 },
      rated: true,
    },
  });

  return cdrs.reduce((sum, cdr) => sum + cdr.cost, 0);
}

// ─── GENERATE SEPA REMITTANCE ─────────────────────────────────
export async function generateSEPARemittance(period: string) {
  const invoices = await prisma.invoice.findMany({
    where: {
      period,
      status: { in: ["ISSUED", "SENT", "PENDING"] },
      paymentMethod: "SEPA",
      iban: { not: null },
    },
    include: { client: true },
  });

  if (invoices.length === 0) return { success: false, message: "No invoices for SEPA remittance" };

  const remittanceId = `REM-${period.replace("-", "")}-${Date.now()}`;
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);

  // SEPA XML generation would go here (pain.008.001.02 format)
  // For now, we just mark invoices with the remittance ID
  await prisma.invoice.updateMany({
    where: { id: { in: invoices.map((i) => i.id) } },
    data: { remittanceId, status: "PENDING" },
  });

  await prisma.auditLog.create({
    data: {
      action: "SEPA_REMITTANCE_GENERATED",
      entity: "Remittance",
      entityId: remittanceId,
      details: JSON.stringify({
        invoiceCount: invoices.length,
        totalAmount,
        period,
      }),
    },
  });

  return {
    success: true,
    remittanceId,
    invoiceCount: invoices.length,
    totalAmount,
  };
}

// ─── SEND PAYMENT REMINDERS ───────────────────────────────────
export async function sendPaymentReminders() {
  const config = await prisma.billingConfig.findFirst();
  if (!config) return;

  const reminderDate = addDays(new Date(), config.reminderDays);

  const invoices = await prisma.invoice.findMany({
    where: {
      status: { in: ["SENT", "PENDING"] },
      dueDate: { lte: reminderDate, gte: new Date() },
    },
    include: { client: true },
  });

  let sent = 0;
  for (const invoice of invoices) {
    await sendPaymentReminder({
      clientName: invoice.client.name,
      clientEmail: invoice.client.email,
      invoiceNumber: invoice.number,
      total: invoice.total,
      dueDate: format(invoice.dueDate, "dd/MM/yyyy"),
    });
    sent++;
  }

  return { sent };
}

// ─── PROCESS OVERDUE INVOICES ─────────────────────────────────
export async function processOverdueInvoices() {
  const config = await prisma.billingConfig.findFirst();
  if (!config) return;

  // Find overdue invoices
  const overdueDate = addDays(new Date(), -config.overdueNotifyDays);
  const invoices = await prisma.invoice.findMany({
    where: {
      status: { in: ["SENT", "PENDING"] },
      dueDate: { lt: overdueDate },
    },
    include: { client: true },
  });

  let processed = 0;
  for (const invoice of invoices) {
    // Mark as overdue
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: "OVERDUE" },
    });

    // Send overdue notice
    const daysPastDue = differenceInDays(new Date(), invoice.dueDate);
    await sendOverdueNotice({
      clientName: invoice.client.name,
      clientEmail: invoice.client.email,
      invoiceNumber: invoice.number,
      total: invoice.total,
      daysPastDue,
    });

    // Auto-suspend after 2 overdue invoices
    const overdueCount = await prisma.invoice.count({
      where: { clientId: invoice.clientId, status: "OVERDUE" },
    });

    if (overdueCount >= 2) {
      await prisma.client.update({
        where: { id: invoice.clientId },
        data: { status: "SUSPENDED", notes: `Auto-suspendido: ${overdueCount} facturas impagadas` },
      });

      await prisma.service.updateMany({
        where: { clientId: invoice.clientId, status: "ACTIVE" },
        data: { status: "SUSPENDED" },
      });
    }

    processed++;
  }

  return { processed, overdue: invoices.length };
}

// ─── HELPERS ──────────────────────────────────────────────────
async function getNextInvoiceNumber(series: string, period: string): Promise<number> {
  const lastInvoice = await prisma.invoice.findFirst({
    where: { series, period },
    orderBy: { number: "desc" },
  });

  if (!lastInvoice) return 1;
  const lastNum = parseInt(lastInvoice.number.split("-").pop() || "0");
  return lastNum + 1;
}

// ─── CDR IMPORT & RATING ──────────────────────────────────────
export async function importAndRateCDRs(
  cdrs: Array<{
    origin: string;
    destination: string;
    type: string;
    dateTime: string;
    duration: number;
    volumeKB?: number;
  }>,
  source: string = "MANUAL"
) {
  const batchId = `BATCH-${Date.now()}`;
  let processed = 0;
  let errors = 0;

  for (const cdr of cdrs) {
    try {
      // Find client by phone number
      const service = await prisma.service.findFirst({
        where: { phoneNumber: cdr.origin, status: "ACTIVE" },
        include: { plan: true },
      });

      if (!service) continue;

      // Rate the CDR
      const cost = rateCDR(cdr);

      await prisma.cDR.create({
        data: {
          clientId: service.clientId,
          serviceId: service.id,
          type: cdr.type as any,
          origin: cdr.origin,
          destination: cdr.destination,
          dateTime: new Date(cdr.dateTime),
          duration: cdr.duration,
          volumeKB: cdr.volumeKB || 0,
          cost,
          rated: true,
          importBatchId: batchId,
          importSource: source,
        },
      });

      processed++;
    } catch {
      errors++;
    }
  }

  return { batchId, processed, errors, total: cdrs.length };
}

function rateCDR(cdr: { destination: string; type: string; duration: number }): number {
  if (cdr.type === "VOICE_OUT") {
    const dest = cdr.destination;
    if (dest.startsWith("900") || dest.startsWith("800")) return 0;
    if (dest.startsWith("902")) return Math.ceil(cdr.duration / 60) * 0.35;
    if (dest.startsWith("806") || dest.startsWith("807")) return Math.ceil(cdr.duration / 60) * 1.18;
    if (dest.startsWith("00")) return Math.ceil(cdr.duration / 60) * 0.50; // International
    return 0; // Included in plan
  }
  if (cdr.type === "SMS_OUT") return 0.09;
  return 0;
}
