import { NextRequest, NextResponse } from "next/server";
import {
  getWooWebhookDeliveryById,
  listWooWebhookDeliveriesMemory,
} from "@/features/woocommerce/services/woo-webhook-deliveries-memory-store";
import { requireScopeFull } from "@/lib/api-control-auth";

/**
 * ‎GET: آخر تسليمات ‎Woo webhook المسجّلة في ذاكرة الخادم (لا Firebase).
 * يُعاد ضبط السجل عند إعادة تشغيل الـ instance أو التوسّع الأفقي.
 */
export async function GET(request: NextRequest) {
  const auth = await requireScopeFull(request);
  if (auth instanceof NextResponse) return auth;

  const sp = request.nextUrl.searchParams;
  const singleId = sp.get("id")?.trim() || null;
  const limit = Math.min(100, Math.max(1, Number(sp.get("limit") ?? 30) || 30));
  const cursor = sp.get("cursor")?.trim() || null;

  try {
    if (singleId) {
      const d = getWooWebhookDeliveryById(singleId);
      if (!d) {
        return NextResponse.json({ error: "غير موجود" }, { status: 404 });
      }
      return NextResponse.json({
        ok: true,
        enabled: true,
        storage: "memory" as const,
        item: {
          id: d.id,
          receivedAt: d.receivedAt,
          status: d.status,
          error: d.error,
          topic: d.topic,
          eventType: d.eventType,
          resourceId: d.resourceId,
          wcWebhookId: d.wcWebhookId,
          wcWebhookResource: d.wcWebhookResource,
          bodySha256: d.bodySha256,
          bodyBytes: d.bodyBytes,
          processingTimeMs: d.processingTimeMs,
          payloadExcerpt: d.payloadExcerpt,
          zodValidationError: d.zodValidationError,
        },
      });
    }

    const { items: rows, nextCursor } = listWooWebhookDeliveriesMemory(limit, cursor);
    const items = rows.map((data) => {
      const excerpt = data.payloadExcerpt;
      return {
        id: data.id,
        receivedAt: data.receivedAt,
        status: data.status,
        error: data.error,
        topic: data.topic,
        eventType: data.eventType,
        resourceId: data.resourceId,
        wcWebhookId: data.wcWebhookId,
        wcWebhookResource: data.wcWebhookResource,
        bodySha256: data.bodySha256,
        bodyBytes: data.bodyBytes,
        processingTimeMs: data.processingTimeMs,
        zodValidationError: data.zodValidationError,
        payloadPreview:
          excerpt && excerpt.length > 0
            ? excerpt.length > 360
              ? `${excerpt.slice(0, 360)}…`
              : excerpt
            : null,
      };
    });

    return NextResponse.json({
      ok: true,
      enabled: true,
      storage: "memory" as const,
      message:
        "السجل في ذاكرة الخادم فقط (جلسة العملية) — لا يُحفظ في Firebase ويُفقد بعد إعادة التشغيل.",
      items,
      nextCursor,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "List failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
