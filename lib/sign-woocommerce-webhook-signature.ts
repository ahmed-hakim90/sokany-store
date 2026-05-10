/**
 * توقيع ويبهوك (اختبارات / أدوات)
 * بالعامية: نفس صيغة Woo — HMAC-SHA256 على النص الخام ثم base64.
 */
import { createHmac } from "node:crypto";

export function signWooCommerceWebhookSignature(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
}
