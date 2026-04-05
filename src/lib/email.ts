/**
 * Email Service — Powered by Resend
 * Handles all automated emails: invoices, reminders, welcome, notifications
 */
import { Resend } from "resend";
import prisma from "./db";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "MooviTelecom <noreply@moovitelecom.com>";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "MooviTelecom";

// ─── EMAIL TEMPLATES ──────────────────────────────────────────

function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <div style="background:linear-gradient(135deg,#4f46e5,#6366f1);padding:24px 32px;">
            <h1 style="color:white;margin:0;font-size:20px;font-weight:600;">${APP_NAME}</h1>
          </div>
          <div style="padding:32px;">${content}</div>
          <div style="padding:16px 32px;background:#fafafa;border-top:1px solid #f0f0f0;">
            <p style="margin:0;font-size:12px;color:#999;">
              ${APP_NAME} — Tu operador de confianza<br>
              Este email ha sido enviado automáticamente, no respondas a esta dirección.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ─── INVOICE EMAIL ────────────────────────────────────────────

export async function sendInvoiceEmail(invoice: {
  id: string;
  number: string;
  clientName: string;
  clientEmail: string;
  period: string;
  total: number;
  dueDate: string;
  concept: string;
  pdfUrl?: string;
}) {
  const content = `
    <h2 style="margin:0 0 16px;font-size:18px;color:#1d1d1f;">Hola ${invoice.clientName.split(" ")[0]},</h2>
    <p style="color:#424245;line-height:1.6;margin:0 0 24px;">
      Tu factura del periodo <strong>${invoice.period}</strong> ya está disponible.
    </p>
    <div style="background:#f5f5f7;border-radius:12px;padding:20px;margin:0 0 24px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:6px 0;color:#86868b;">Nº Factura</td><td style="padding:6px 0;text-align:right;font-weight:600;color:#1d1d1f;">${invoice.number}</td></tr>
        <tr><td style="padding:6px 0;color:#86868b;">Concepto</td><td style="padding:6px 0;text-align:right;color:#1d1d1f;">${invoice.concept}</td></tr>
        <tr><td style="padding:6px 0;color:#86868b;">Periodo</td><td style="padding:6px 0;text-align:right;color:#1d1d1f;">${invoice.period}</td></tr>
        <tr><td style="padding:6px 0;color:#86868b;">Vencimiento</td><td style="padding:6px 0;text-align:right;color:#1d1d1f;">${invoice.dueDate}</td></tr>
        <tr style="border-top:1px solid #e5e5e5;"><td style="padding:12px 0 6px;color:#1d1d1f;font-weight:600;font-size:16px;">Total</td><td style="padding:12px 0 6px;text-align:right;font-weight:700;font-size:20px;color:#4f46e5;">${invoice.total.toFixed(2)}€</td></tr>
      </table>
    </div>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/facturas" style="display:inline-block;background:#4f46e5;color:white;text-decoration:none;padding:12px 32px;border-radius:10px;font-weight:600;font-size:14px;">
        Ver factura completa
      </a>
    </div>
    <p style="color:#86868b;font-size:13px;line-height:1.5;">
      El cobro se realizará automáticamente por ${invoice.period.includes("SEPA") ? "domiciliación SEPA" : "el método de pago registrado"}
      en la fecha de vencimiento. Si tienes alguna duda, contacta con nosotros.
    </p>
  `;

  return sendEmail({
    to: invoice.clientEmail,
    subject: `Factura ${invoice.number} — ${invoice.period}`,
    template: "invoice",
    html: baseTemplate(content),
    metadata: { invoiceId: invoice.id },
  });
}

// ─── PAYMENT REMINDER ─────────────────────────────────────────

export async function sendPaymentReminder(data: {
  clientName: string;
  clientEmail: string;
  invoiceNumber: string;
  total: number;
  dueDate: string;
}) {
  const content = `
    <h2 style="margin:0 0 16px;font-size:18px;color:#1d1d1f;">Hola ${data.clientName.split(" ")[0]},</h2>
    <p style="color:#424245;line-height:1.6;margin:0 0 16px;">
      Te recordamos que la factura <strong>${data.invoiceNumber}</strong> por importe de
      <strong style="color:#4f46e5;">${data.total.toFixed(2)}€</strong> vence el <strong>${data.dueDate}</strong>.
    </p>
    <p style="color:#424245;line-height:1.6;margin:0 0 24px;">
      Si ya has realizado el pago, puedes ignorar este mensaje.
    </p>
    <div style="text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/facturas" style="display:inline-block;background:#4f46e5;color:white;text-decoration:none;padding:12px 32px;border-radius:10px;font-weight:600;font-size:14px;">
        Consultar mis facturas
      </a>
    </div>
  `;

  return sendEmail({
    to: data.clientEmail,
    subject: `Recordatorio: Factura ${data.invoiceNumber} próxima a vencer`,
    template: "payment_reminder",
    html: baseTemplate(content),
  });
}

// ─── WELCOME EMAIL ────────────────────────────────────────────

export async function sendWelcomeEmail(data: {
  clientName: string;
  clientEmail: string;
  plan: string;
  portalPassword?: string;
}) {
  const content = `
    <h2 style="margin:0 0 16px;font-size:18px;color:#1d1d1f;">¡Bienvenido/a, ${data.clientName.split(" ")[0]}! 🎉</h2>
    <p style="color:#424245;line-height:1.6;margin:0 0 16px;">
      Tu alta en <strong>${APP_NAME}</strong> se ha completado correctamente. Ya puedes disfrutar de tu plan <strong>${data.plan}</strong>.
    </p>
    ${data.portalPassword ? `
    <div style="background:#f0f0ff;border-radius:12px;padding:20px;margin:0 0 24px;border:1px solid #e0e0ff;">
      <p style="margin:0 0 8px;font-weight:600;color:#4f46e5;">Acceso a tu Área de Cliente</p>
      <p style="margin:0;color:#424245;font-size:14px;">
        Usuario: <strong>${data.clientEmail}</strong><br>
        Contraseña: <strong>${data.portalPassword}</strong>
      </p>
      <p style="margin:8px 0 0;color:#86868b;font-size:12px;">Te recomendamos cambiar la contraseña en tu primer acceso.</p>
    </div>
    ` : ""}
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal" style="display:inline-block;background:#4f46e5;color:white;text-decoration:none;padding:12px 32px;border-radius:10px;font-weight:600;font-size:14px;">
        Acceder a mi área
      </a>
    </div>
    <p style="color:#86868b;font-size:13px;">Si tienes alguna pregunta, nuestro equipo está disponible para ayudarte.</p>
  `;

  return sendEmail({
    to: data.clientEmail,
    subject: `¡Bienvenido/a a ${APP_NAME}!`,
    template: "welcome",
    html: baseTemplate(content),
  });
}

// ─── PORTABILITY NOTIFICATION ─────────────────────────────────

export async function sendPortabilityUpdate(data: {
  clientName: string;
  clientEmail: string;
  phoneNumber: string;
  status: string;
  windowDate?: string;
}) {
  const statusMessages: Record<string, string> = {
    ACCEPTED: "Tu solicitud de portabilidad ha sido aceptada por el operador donante.",
    WINDOW_ASSIGNED: `Se ha asignado una ventana de portabilidad para el <strong>${data.windowDate || "próximos días"}</strong>.`,
    COMPLETED: `¡Tu número <strong>${data.phoneNumber}</strong> ya está portado a ${APP_NAME}!`,
    REJECTED: "Lamentablemente, la solicitud de portabilidad ha sido rechazada.",
  };

  const content = `
    <h2 style="margin:0 0 16px;font-size:18px;color:#1d1d1f;">Actualización de portabilidad</h2>
    <p style="color:#424245;line-height:1.6;margin:0 0 16px;">
      Hola ${data.clientName.split(" ")[0]}, te informamos sobre el estado de la portabilidad del número <strong>${data.phoneNumber}</strong>:
    </p>
    <div style="background:#f5f5f7;border-radius:12px;padding:20px;margin:0 0 24px;">
      <p style="margin:0;color:#1d1d1f;font-size:15px;">${statusMessages[data.status] || `Estado actual: ${data.status}`}</p>
    </div>
  `;

  return sendEmail({
    to: data.clientEmail,
    subject: `Portabilidad ${data.phoneNumber} — ${data.status === "COMPLETED" ? "¡Completada!" : "Actualización"}`,
    template: "portability_update",
    html: baseTemplate(content),
  });
}

// ─── OVERDUE NOTICE ───────────────────────────────────────────

export async function sendOverdueNotice(data: {
  clientName: string;
  clientEmail: string;
  invoiceNumber: string;
  total: number;
  daysPastDue: number;
}) {
  const content = `
    <h2 style="margin:0 0 16px;font-size:18px;color:#1d1d1f;">Aviso de factura impagada</h2>
    <p style="color:#424245;line-height:1.6;margin:0 0 16px;">
      Hola ${data.clientName.split(" ")[0]}, te informamos que la factura <strong>${data.invoiceNumber}</strong>
      por importe de <strong style="color:#ef4444;">${data.total.toFixed(2)}€</strong> lleva
      <strong>${data.daysPastDue} días</strong> vencida.
    </p>
    <p style="color:#424245;line-height:1.6;margin:0 0 24px;">
      Por favor, realiza el pago lo antes posible para evitar la suspensión del servicio.
    </p>
    <div style="text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/facturas" style="display:inline-block;background:#ef4444;color:white;text-decoration:none;padding:12px 32px;border-radius:10px;font-weight:600;font-size:14px;">
        Pagar ahora
      </a>
    </div>
  `;

  return sendEmail({
    to: data.clientEmail,
    subject: `⚠️ Factura ${data.invoiceNumber} impagada — Acción requerida`,
    template: "overdue_notice",
    html: baseTemplate(content),
  });
}

// ─── CORE SEND FUNCTION ───────────────────────────────────────

async function sendEmail(params: {
  to: string;
  subject: string;
  template: string;
  html: string;
  metadata?: Record<string, string>;
}) {
  try {
    const result = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    // Log the email
    await prisma.emailLog.create({
      data: {
        to: params.to,
        subject: params.subject,
        template: params.template,
        status: "sent",
        messageId: result.data?.id,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";

    await prisma.emailLog.create({
      data: {
        to: params.to,
        subject: params.subject,
        template: params.template,
        status: "failed",
        error: errorMsg,
      },
    });

    console.error(`[Email] Failed to send to ${params.to}:`, errorMsg);
    return { success: false, error: errorMsg };
  }
}

export { sendEmail };
