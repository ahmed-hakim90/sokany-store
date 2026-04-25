import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { WOO_WEBHOOK_DELIVERIES_COLLECTION } from "@/features/woocommerce/lib/firestore-collections";
import { requireScopeFull } from "@/lib/api-control-auth";
import { getAdminFirestore } from "@/lib/firebase-admin";

function toMillis(v: unknown): number | null {
  if (v && typeof v === "object" && "toDate" in v) {
    const t = (v as admin.firestore.Timestamp).toDate();
    if (!Number.isNaN(t.getTime())) return t.getTime();
  }
  return null;
}

const WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_SCAN = 2000;

/**
 * ‎GET: معدّلات آخر ‎24 ساعة (أو أقرب ‎N سجل) + آخر ‎`receivedAt`‎.
 */
export async function GET(request: NextRequest) {
  const auth = await requireScopeFull(request);
  if (auth instanceof NextResponse) return auth;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json({
      ok: true,
      enabled: false,
      message: "FIREBASE_SERVICE_ACCOUNT_JSON غير مضبوط — لا إحصاءات من Firestore.",
      lastEventAt: null as string | null,
      windowHours: 24,
      totalInWindow: 0,
      processed: 0,
      failed: 0,
      successRatePercent: null as number | null,
      avgProcessingTimeMs: null as number | null,
      sampleSize: 0,
    });
  }

  try {
    const db = getAdminFirestore();
    const col = db.collection(WOO_WEBHOOK_DELIVERIES_COLLECTION);
    const snap = await col.orderBy("receivedAt", "desc").limit(MAX_SCAN).get();
    const now = Date.now();
    const from = now - WINDOW_MS;
    let lastEventAt: string | null = null;
    let processed = 0;
    let failed = 0;
    let sumMs = 0;
    let nMs = 0;

    for (const d of snap.docs) {
      const data = d.data();
      const at = toMillis(data.receivedAt);
      if (at == null) continue;
      if (lastEventAt === null) {
        lastEventAt = new Date(at).toISOString();
      }
      if (at < from) continue;
      if (data.status === "failed") failed += 1;
      else processed += 1;
      if (typeof data.processingTimeMs === "number" && Number.isFinite(data.processingTimeMs)) {
        sumMs += data.processingTimeMs;
        nMs += 1;
      }
    }

    const total = processed + failed;
    const successRatePercent =
      total > 0 ? Math.round((processed / total) * 1000) / 10 : null;
    const avgProcessingTimeMs = nMs > 0 ? Math.round(sumMs / nMs) : null;

    return NextResponse.json({
      ok: true,
      enabled: true,
      lastEventAt,
      windowHours: 24,
      totalInWindow: total,
      processed,
      failed,
      successRatePercent,
      avgProcessingTimeMs,
      sampleSize: total,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Aggregates failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
