import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { WOO_WEBHOOK_DELIVERIES_COLLECTION } from "@/features/woocommerce/lib/firestore-collections";
import { requireScopeFull } from "@/lib/api-control-auth";
import { getAdminFirestore } from "@/lib/firebase-admin";

function receivedAtToIso(v: unknown): string {
  if (v && typeof v === "object" && "toDate" in v) {
    const t = (v as admin.firestore.Timestamp).toDate();
    if (!Number.isNaN(t.getTime())) return t.toISOString();
  }
  return new Date(0).toISOString();
}

/**
 * ‎GET: آخر تسليمات ‎Woo ‎webhook ‎المسجّلة في ‎Firestore (للمراقبة من لوحة ‎/control/woo-api‎).
 */
export async function GET(request: NextRequest) {
  const auth = await requireScopeFull(request);
  if (auth instanceof NextResponse) return auth;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json({
      ok: true,
      enabled: false,
      message:
        "FIREBASE_SERVICE_ACCOUNT_JSON غير مضبوط — لا يُسجّل تسليمات الـ webhook في قاعدة بيانات.",
      items: [] as unknown[],
      nextCursor: null as string | null,
    });
  }

  const sp = request.nextUrl.searchParams;
  const singleId = sp.get("id")?.trim() || null;
  const limit = Math.min(100, Math.max(1, Number(sp.get("limit") ?? 30) || 30));
  const cursor = sp.get("cursor")?.trim() || null;

  try {
    const db = getAdminFirestore();
    const col = db.collection(WOO_WEBHOOK_DELIVERIES_COLLECTION);

    if (singleId) {
      const d = await col.doc(singleId).get();
      if (!d.exists) {
        return NextResponse.json({ error: "غير موجود" }, { status: 404 });
      }
      const data = d.data();
      if (!data) {
        return NextResponse.json({ error: "بيانات ناقصة" }, { status: 500 });
      }
      return NextResponse.json({
        ok: true,
        enabled: true,
        item: {
          id: d.id,
          receivedAt: receivedAtToIso(data.receivedAt),
          status: data.status === "failed" ? "failed" : "processed",
          error: typeof data.error === "string" ? data.error : null,
          topic: typeof data.topic === "string" ? data.topic : null,
          eventType: typeof data.eventType === "string" ? data.eventType : null,
          resourceId: typeof data.resourceId === "string" ? data.resourceId : null,
          wcWebhookId: typeof data.wcWebhookId === "string" ? data.wcWebhookId : null,
          wcWebhookResource:
            typeof data.wcWebhookResource === "string" ? data.wcWebhookResource : null,
          bodySha256: typeof data.bodySha256 === "string" ? data.bodySha256 : "",
          bodyBytes: typeof data.bodyBytes === "number" ? data.bodyBytes : 0,
          processingTimeMs:
            typeof data.processingTimeMs === "number" ? data.processingTimeMs : null,
          payloadExcerpt: typeof data.payloadExcerpt === "string" ? data.payloadExcerpt : null,
          zodValidationError:
            typeof data.zodValidationError === "string" ? data.zodValidationError : null,
        },
      });
    }

    let q = col.orderBy("receivedAt", "desc").limit(limit);
    if (cursor) {
      const cur = await col.doc(cursor).get();
      if (cur.exists) {
        q = col.orderBy("receivedAt", "desc").startAfter(cur).limit(limit);
      }
    }
    const snap = await q.get();
    const items = snap.docs.map((d) => {
      const data = d.data();
      const excerpt =
        typeof data.payloadExcerpt === "string" ? data.payloadExcerpt : null;
      return {
        id: d.id,
        receivedAt: receivedAtToIso(data.receivedAt),
        status: data.status === "failed" ? "failed" : "processed",
        error: typeof data.error === "string" ? data.error : null,
        topic: typeof data.topic === "string" ? data.topic : null,
        eventType: typeof data.eventType === "string" ? data.eventType : null,
        resourceId: typeof data.resourceId === "string" ? data.resourceId : null,
        wcWebhookId: typeof data.wcWebhookId === "string" ? data.wcWebhookId : null,
        wcWebhookResource:
          typeof data.wcWebhookResource === "string" ? data.wcWebhookResource : null,
        bodySha256: typeof data.bodySha256 === "string" ? data.bodySha256 : "",
        bodyBytes: typeof data.bodyBytes === "number" ? data.bodyBytes : 0,
        processingTimeMs:
          typeof data.processingTimeMs === "number" ? data.processingTimeMs : null,
        zodValidationError:
          typeof data.zodValidationError === "string" ? data.zodValidationError : null,
        /** معاينة قصيرة للبطاقة — التفاصيل عبر ‎`?id=`‎ */
        payloadPreview:
          excerpt && excerpt.length > 0
            ? excerpt.length > 360
              ? `${excerpt.slice(0, 360)}…`
              : excerpt
            : null,
      };
    });
    const last = snap.docs[snap.docs.length - 1];
    const nextCursor = snap.docs.length === limit && last ? last.id : null;
    return NextResponse.json({ ok: true, enabled: true, items, nextCursor });
  } catch (e) {
    const message = e instanceof Error ? e.message : "List failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
