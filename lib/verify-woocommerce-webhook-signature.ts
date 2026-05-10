/**
 * التحقق من توقيع ويبهوك Woo
 * بالعامية: Woo بيبعت `X-WC-Webhook-Signature` = Base64(HMAC-SHA256 للجسم الخام بالسرّ)؛ لازم يطابق `WC_WEBHOOK_SECRET`.
 *
 * شوف كمان: `@/app/api/webhooks/woocommerce/route.ts`
 */
import { verifyHmacSha256Base64Body } from "./verify-hmac-sha256-body-base64";

export function verifyWooCommerceWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  return verifyHmacSha256Base64Body(rawBody, signatureHeader, secret);
}
