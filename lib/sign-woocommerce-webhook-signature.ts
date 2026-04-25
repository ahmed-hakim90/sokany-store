import { createHmac } from "node:crypto";

/**
 * نفس ‎Woo: ‎`Base64( HMAC-SHA256( secret, rawBody ) )`‎.
 */
export function signWooCommerceWebhookSignature(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
}
