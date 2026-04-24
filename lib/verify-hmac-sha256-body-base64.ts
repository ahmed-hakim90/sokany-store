import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * يتحقق من ‎HMAC-SHA256(body)‎ مُشفّر بـ Base64 (نفس وضع ووردبريس) لجسم الـ request الخام.
 */
export function verifyHmacSha256Base64Body(
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
