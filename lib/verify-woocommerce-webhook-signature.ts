import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verifies `X-WC-Webhook-Signature` (base64 HMAC-SHA256 of the raw body)
 * against the webhook secret from WooCommerce → Settings → Advanced → Webhooks.
 */
export function verifyWooCommerceWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader || !secret) return false;

  const expected = createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(signatureHeader.trim(), "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
