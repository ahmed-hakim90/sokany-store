import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { checkInMemoryRateLimit, rateLimitKeyForRequest } from "@/lib/in-memory-rate-limit";

describe("checkInMemoryRateLimit", () => {
  it("allows under max and blocks after", () => {
    const key = rateLimitKeyForRequest("t", "1.2.3.4");
    expect(checkInMemoryRateLimit(key, 2, 60_000).ok).toBe(true);
    expect(checkInMemoryRateLimit(key, 2, 60_000).ok).toBe(true);
    const third = checkInMemoryRateLimit(key, 2, 60_000);
    expect(third.ok).toBe(false);
    if (!third.ok) expect(third.retryAfterSec).toBeGreaterThan(0);
  });
});
