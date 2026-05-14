import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import {
  buildWooWebhookDedupeKey,
  shouldSkipWebhookRevalidation,
} from "@/lib/webhook-dedupe";

describe("webhook revalidation dedupe", () => {
  it("dedupes identical webhook keys within the TTL", () => {
    const key = `test:${randomUUID()}`;

    expect(shouldSkipWebhookRevalidation(key, 20_000)).toBe(false);
    expect(shouldSkipWebhookRevalidation(key, 20_000)).toBe(true);
  });

  it("does not block different resources for the same event type", () => {
    const prefix = randomUUID();
    const first = `${prefix}:product.updated:1`;
    const second = `${prefix}:product.updated:2`;

    expect(shouldSkipWebhookRevalidation(first, 20_000)).toBe(false);
    expect(shouldSkipWebhookRevalidation(second, 20_000)).toBe(false);
  });

  it("builds stable Woo keys from topic and resource id", () => {
    expect(buildWooWebhookDedupeKey("Product.Updated", 73746)).toBe(
      "woo:product.updated:73746",
    );
    expect(buildWooWebhookDedupeKey(null, null)).toBe("woo:unknown:none");
  });
});

