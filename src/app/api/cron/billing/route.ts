/**
 * Cron Job: Automated Billing
 * Runs on the 1st of each month via Vercel Cron
 * Generates invoices, sends emails, and processes overdue
 *
 * Add to vercel.json:
 * { "crons": [{ "path": "/api/cron/billing", "schedule": "0 6 1 * *" }] }
 */
import { NextRequest, NextResponse } from "next/server";
import {
  generateMonthlyInvoices,
  sendPaymentReminders,
  processOverdueInvoices,
  generateSEPARemittance,
} from "@/lib/billing";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

  try {
    // Step 1: Process overdue invoices from previous months
    results.overdue = await processOverdueInvoices();

    // Step 2: Generate new invoices for current month
    results.invoices = await generateMonthlyInvoices();

    // Step 3: Generate SEPA remittance for current month
    const period = new Date().toISOString().substring(0, 7);
    results.sepa = await generateSEPARemittance(period);

    // Step 4: Send payment reminders for upcoming due dates
    results.reminders = await sendPaymentReminders();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error("[Cron:Billing] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        results,
      },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes for Vercel Pro
