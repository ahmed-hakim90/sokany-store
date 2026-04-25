import { verifyHmacSha256Base64Body } from "./verify-hmac-sha256-body-base64";

/**
 * Verifies `X-WC-Webhook-Signature` (base64 HMAC-SHA256 of the raw body)
 * against the webhook secret from WooCommerce → Settings → Advanced → Webhooks.
 */
export function verifyWooCommerceWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  return verifyHmacSha256Base64Body(rawBody, signatureHeader, secret);
}
