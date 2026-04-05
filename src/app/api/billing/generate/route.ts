/**
 * Manual billing generation endpoint
 * POST /api/billing/generate { period: "2026-03" }
 */
import { NextRequest, NextResponse } from "next/server";
import { generateMonthlyInvoices } from "@/lib/billing";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const period = body.period;

    if (!period || !/^\d{4}-\d{2}$/.test(period)) {
      return NextResponse.json({ error: "Invalid period format. Use YYYY-MM" }, { status: 400 });
    }

    const result = await generateMonthlyInvoices(period);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[API:Billing] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
