import { describe, expect, it } from "vitest";
import { getStorefrontApiErrorCopy } from "@/lib/storefront-api-error";

describe("getStorefrontApiErrorCopy", () => {
  it("maps 429 and 503", () => {
    const r429 = getStorefrontApiErrorCopy(429);
    expect(r429.retryable).toBe(true);
    expect(r429.title).toMatch(/طلبات/);

    const r503 = getStorefrontApiErrorCopy(503);
    expect(r503.retryable).toBe(true);
    expect(r503.title).toMatch(/الخادم/);
  });

  it("maps 404 as non-retryable", () => {
    const r = getStorefrontApiErrorCopy(404);
    expect(r.retryable).toBe(false);
  });
});
