import "server-only";

import * as admin from "firebase-admin";
import { createHash } from "node:crypto";
import { WOO_WEBHOOK_DELIVERIES_COLLECTION } from "@/features/woocommerce/lib/firestore-collections";
import { getAdminFirestore } from "@/lib/firebase-admin";

/** حدّ قريب من حدود ‎Firestore — نخزّن نص الخام (مقصوص) للتشخيص. */
const PAYLOAD_EXCERPT_MAX = 10_000;

function payloadExcerpt(raw: string): string {
  if (raw.length <= PAYLOAD_EXCERPT_MAX) return raw;
  return `${raw.slice(0, PAYLOAD_EXCERPT_MAX)}\n/* … مقصوص */`;
}

/**
 * يسجّل تسليماً موقّعاً ناجحاً (بعد التحقق من التوقيع).
 * بلا ‎FIREBASE_SERVICE_ACCOUNT_JSON‎ لا يفعل شيئاً.
 */
export async function recordWooWebhookDelivery(input: {
  requestHeaders: Headers;
  rawBody: string;
  topic: string | null;
  eventType: string | null;
  resourceId: string | number | null;
  status: "processed" | "failed";
  errorMessage?: string | null;
  processingTimeMs: number;
  zodValidationError?: string | null;
}): Promise<void> {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) return;
  const bodyBytes = Buffer.byteLength(input.rawBody, "utf8");
  const bodySha256 = createHash("sha256").update(input.rawBody, "utf8").digest("hex");
  const resourceIdStr =
    input.resourceId == null
      ? null
      : typeof input.resourceId === "number"
        ? String(input.resourceId)
        : String(input.resourceId);

  const doc: Record<string, unknown> = {
    receivedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: input.status,
    error: input.errorMessage?.trim() ? input.errorMessage.slice(0, 2000) : null,
    topic: input.topic,
    eventType: input.eventType,
    resourceId: resourceIdStr,
    wcWebhookId: input.requestHeaders.get("X-WC-Webhook-ID"),
    wcWebhookResource: input.requestHeaders.get("X-WC-Webhook-Resource"),
    bodySha256,
    bodyBytes,
    processingTimeMs: input.processingTimeMs,
    payloadExcerpt: payloadExcerpt(input.rawBody),
    zodValidationError:
      input.zodValidationError?.trim() && input.zodValidationError.length > 0
        ? input.zodValidationError.slice(0, 4000)
        : null,
  };

  try {
    const db = getAdminFirestore();
    await db.collection(WOO_WEBHOOK_DELIVERIES_COLLECTION).add(doc);
  } catch (e) {
    console.error("[woocommerce-webhook] Firestore record failed", e);
  }
}
