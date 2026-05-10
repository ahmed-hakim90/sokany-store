import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyHmacSha256Base64Body } from "@/lib/verify-hmac-sha256-body-base64";
import { verifyWooCommerceWebhookSignature } from "@/lib/verify-woocommerce-webhook-signature";

function wooSignature(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
}

describe("verifyHmacSha256Base64Body", () => {
  it("accepts valid Woo-style Base64 HMAC", () => {
    const secret = "test-secret";
    const body = '{"id":1}';
    const sig = wooSignature(body, secret);
    expect(verifyHmacSha256Base64Body(body, sig, secret)).toBe(true);
  });

  it("rejects wrong secret", () => {
    const body = "{}";
    const sig = wooSignature(body, "a");
    expect(verifyHmacSha256Base64Body(body, sig, "b")).toBe(false);
  });

  it("rejects tampered body", () => {
    const secret = "s";
    const sig = wooSignature('{"a":1}', secret);
    expect(verifyHmacSha256Base64Body('{"a":2}', sig, secret)).toBe(false);
  });

  it("rejects null or empty signature header", () => {
    expect(verifyHmacSha256Base64Body("x", null, "sec")).toBe(false);
    expect(verifyHmacSha256Base64Body("x", "", "sec")).toBe(false);
  });

  it("rejects empty secret", () => {
    expect(verifyHmacSha256Base64Body("x", "y", "")).toBe(false);
  });

  it("trims signature header whitespace", () => {
    const secret = "sec";
    const body = "raw";
    const sig = wooSignature(body, secret);
    expect(verifyHmacSha256Base64Body(body, `  ${sig}  `, secret)).toBe(true);
  });
});

describe("verifyWooCommerceWebhookSignature", () => {
  it("delegates to HMAC helper", () => {
    const secret = "wh";
    const raw = "payload";
    const sig = wooSignature(raw, secret);
    expect(verifyWooCommerceWebhookSignature(raw, sig, secret)).toBe(true);
  });
});
