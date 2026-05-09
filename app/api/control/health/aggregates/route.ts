import { NextRequest, NextResponse } from "next/server";
import { aggregateWooWebhookDeliveriesMemory } from "@/features/woocommerce/services/woo-webhook-deliveries-memory-store";
import { requireScopeFull } from "@/lib/api-control-auth";

const WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * ‎GET: معدّلات آخر ‎24 ساعة من ذاكرة الخادم (نفس مصدر لوحة تسليمات الـ webhook — لا Firebase).
 */
export async function GET(request: NextRequest) {
  const auth = await requireScopeFull(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const {
      lastEventAt,
      processed,
      failed,
      avgProcessingTimeMs,
      sampleSize,
    } = aggregateWooWebhookDeliveriesMemory(WINDOW_MS);

    const total = processed + failed;
    const successRatePercent =
      total > 0 ? Math.round((processed / total) * 1000) / 10 : null;

    return NextResponse.json({
      ok: true,
      enabled: true,
      storage: "memory" as const,
      message:
        "الإحصاءات من ذاكرة الخادم فقط — تتوافق مع سجل التسليمات المعروض في اللوحة ولا تُقرأ من Firebase.",
      lastEventAt,
      windowHours: 24,
      totalInWindow: total,
      processed,
      failed,
      successRatePercent,
      avgProcessingTimeMs,
      sampleSize,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Aggregates failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
