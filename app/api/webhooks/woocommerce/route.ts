/**
 * ويبهوك Woo → إبطال كاش + إشعار للعملاء
 * بالعامية: Woo يبعت توقيع HMAC؛ لو صح بنعمل revalidate حسب الـ topic، وبنحاول نبعت للـ SW يحدّث TanStack، ونسجّل التسليم.
 *
 * ملاحظات:
 * - من غير `WC_WEBHOOK_SECRET` المسار بيرفض — عشان محدش يلعب في الكاش.
 * - شوف كمان: `@/lib/verify-woocommerce-webhook-signature.ts`، `@/features/woocommerce/revalidate-after-product-webhook.ts`
 */
import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit-response";
import {
  extractWooWebhookResourceId,
  revalidateAfterWooCommerceWebhook,
} from "@/features/woocommerce/revalidate-after-product-webhook";
import { sendWooCacheInvalidation } from "@/features/push/services/send-woo-cache-invalidation";
import { recordWooWebhookDelivery } from "@/features/woocommerce/services/record-woo-webhook-delivery";
import { zodIssuesToJsonString } from "@/lib/zod-issues-compact";
import { logServerJson } from "@/lib/server-log";
import { verifyWooCommerceWebhookSignature } from "@/lib/verify-woocommerce-webhook-signature";
import { wpProductSchema } from "@/schemas/wordpress";

export async function POST(request: Request) {
  const t0 = Date.now();
  const limited = enforceRateLimit(request, {
    routeId: "webhook-woocommerce",
    max: 600,
    windowMs: 60 * 1000,
  });
  if (limited) return limited;

  const secret = process.env.WC_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret is not configured (WC_WEBHOOK_SECRET)" },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-wc-webhook-signature");

  if (!verifyWooCommerceWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = rawBody.length ? JSON.parse(rawBody) : null;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const topic = request.headers.get("x-wc-webhook-topic");
  const resourceIdRaw = extractWooWebhookResourceId(payload);
  const resourceId = resourceIdRaw === undefined ? null : resourceIdRaw;

  let zodValidationError: string | null = null;
  const tl = (topic ?? "").toLowerCase();
  if (tl.startsWith("product.")) {
    const parsed = wpProductSchema.safeParse(payload);
    if (!parsed.success) {
      zodValidationError = zodIssuesToJsonString(parsed.error);
    }
  }

  try {
    revalidateAfterWooCommerceWebhook(topic, payload);
  } catch (err) {
    console.error("[woocommerce-webhook] revalidate failed", err);
    const msg = err instanceof Error ? err.message : String(err);
    await recordWooWebhookDelivery({
      requestHeaders: request.headers,
      rawBody,
      topic,
      eventType: topic,
      resourceId,
      status: "failed",
      errorMessage: msg,
      processingTimeMs: Date.now() - t0,
      zodValidationError,
    });
    return NextResponse.json(
      { error: "Cache revalidation failed" },
      { status: 500 },
    );
  }

  try {
    await sendWooCacheInvalidation({ topic, resourceId });
  } catch (err) {
    console.error("[woocommerce-webhook] push invalidation failed", err);
  }

  await recordWooWebhookDelivery({
    requestHeaders: request.headers,
    rawBody,
    topic,
    eventType: topic,
    resourceId,
    status: "processed",
    processingTimeMs: Date.now() - t0,
    zodValidationError,
  });

  logServerJson("woocommerce_webhook_processed", {
    topic,
    resourceId,
    ms: Date.now() - t0,
  });

  return NextResponse.json({
    ok: true,
    topic,
    resourceId,
  });
}

export function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
