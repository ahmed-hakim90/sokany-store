import "server-only";

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

/**
 * Fixed-window rate limit (لكل instance خادم — يكفي كطبقة أولى؛ للإنتاج الجاد استخدم WAF أو Redis).
 */
export function checkInMemoryRateLimit(
  key: string,
  max: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const b = store.get(key);
  if (!b || now >= b.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (b.count >= max) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((b.resetAt - now) / 1000)),
    };
  }
  b.count += 1;
  return { ok: true };
}

export function rateLimitKeyForRequest(
  routeId: string,
  ip: string | undefined,
): string {
  return `${routeId}:${ip ?? "unknown"}`;
}
