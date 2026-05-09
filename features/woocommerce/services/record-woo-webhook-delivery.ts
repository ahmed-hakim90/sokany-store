import "server-only";

import { appendWooWebhookDeliveryMemory } from "@/features/woocommerce/services/woo-webhook-deliveries-memory-store";

/**
 * يسجّل تسليماً موقّعاً (بعد التحقق من التوقيع).
 * التخزين في ذاكرة الـ process فقط — للعرض في لوحة التحكم؛ لا يُحفظ في Firebase.
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
  try {
    appendWooWebhookDeliveryMemory(input);
  } catch (e) {
    console.error("[woocommerce-webhook] in-memory record failed", e);
  }
}
