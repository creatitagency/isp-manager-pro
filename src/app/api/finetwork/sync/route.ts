/**
 * Finetwork API sync endpoint
 * POST /api/finetwork/sync — Syncs lines, products, and portabilities
 */
import { NextRequest, NextResponse } from "next/server";
import { getFinetworkClient } from "@/lib/finetwork";
import prisma from "@/lib/db";
import { PortabilityStatus, ServiceStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    const finetwork = getFinetworkClient();
    const results: Record<string, unknown> = {};

    switch (action) {
      case "sync_products": {
        const products = await finetwork.getProducts();
        results.products = products.length;
        // Upsert products into local DB
        for (const product of products) {
          await prisma.plan.upsert({
            where: { code: product.id },
            update: {
              name: product.name,
              price: product.price,
              finetworkProductId: product.id,
            },
            create: {
              code: product.id,
              name: product.name,
              type: product.type === "fiber" ? "FIBER" : product.type === "mobile" ? "MOBILE" : "CONVERGENT",
              price: product.price,
              speed: product.speed,
              data: product.data,
              minutes: product.minutes,
              finetworkProductId: product.id,
            },
          });
        }
        break;
      }

      case "sync_lines": {
        let page = 1;
        let totalSynced = 0;
        let hasMore = true;

        while (hasMore) {
          const response = await finetwork.getLines({ page, limit: 100 });
          for (const line of response.data) {
            await prisma.service.updateMany({
              where: { finetworkLineId: line.id },
              data: {
                status: (line.status === "active" ? "ACTIVE" : line.status === "suspended" ? "SUSPENDED" : "CANCELLED") as ServiceStatus,
                iccid: line.iccid,
                imsi: line.imsi,
              },
            });
            totalSynced++;
          }
          hasMore = response.data.length === 100;
          page++;
        }
        results.linesSynced = totalSynced;
        break;
      }

      case "sync_portabilities": {
        const portabilities = await finetwork.getPortabilities();
        for (const porta of portabilities.data) {
          if (porta.type === "portability") {
            await prisma.portability.updateMany({
              where: { finetworkOrderId: porta.id },
              data: {
                status: mapPortabilityStatus(porta.status),
              },
            });
          }
        }
        results.portabilitiesSynced = portabilities.data.length;
        break;
      }

      case "check_coverage": {
        const { postalCode } = body;
        if (!postalCode) return NextResponse.json({ error: "postalCode required" }, { status: 400 });
        results.coverage = await finetwork.checkCoverage(postalCode);
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await prisma.auditLog.create({
      data: {
        action: `FINETWORK_SYNC_${action.toUpperCase()}`,
        entity: "Finetwork",
        details: JSON.stringify(results),
      },
    });

    return NextResponse.json({ success: true, action, ...results });
  } catch (error) {
    console.error("[API:Finetwork] Sync error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}

function mapPortabilityStatus(status: string): PortabilityStatus {
  const map: Record<string, PortabilityStatus> = {
    requested: "REQUESTED",
    pending_documents: "DOCUMENTS",
    sent_to_operator: "SENT_OPERATOR",
    accepted: "ACCEPTED",
    window_assigned: "WINDOW_ASSIGNED",
    completed: "COMPLETED",
    rejected: "REJECTED",
  };
  return map[status] || "REQUESTED";
}
