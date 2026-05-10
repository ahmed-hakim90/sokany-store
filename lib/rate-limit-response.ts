import "server-only";

import { NextResponse } from "next/server";
import { getTrustedClientIp } from "@/lib/client-ip";
import { checkInMemoryRateLimit, rateLimitKeyForRequest } from "@/lib/in-memory-rate-limit";

export type RateLimitRule = {
  /** معرف ثابت للمسار (مثلاً ‎`auth-login`‎). */
  routeId: string;
  max: number;
  windowMs: number;
};

export function rateLimitExceededResponse(retryAfterSec: number): NextResponse {
  return NextResponse.json(
    { error: "طلبات كثيرة جداً. حاول بعد قليل." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
      },
    },
  );
}

/** ‎`null`‎ = مسموح؛ وإلا رد ‎429‎. */
export function enforceRateLimit(
  request: { headers: Headers },
  rule: RateLimitRule,
): NextResponse | null {
  const ip = getTrustedClientIp(request);
  const key = rateLimitKeyForRequest(rule.routeId, ip);
  const r = checkInMemoryRateLimit(key, rule.max, rule.windowMs);
  if (r.ok) return null;
  return rateLimitExceededResponse(r.retryAfterSec);
}
