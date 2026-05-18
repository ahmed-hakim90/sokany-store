import "server-only";

import { enforceRateLimit } from "@/lib/rate-limit-response";

const ONE_MINUTE_MS = 60 * 1000;

export function enforceCatalogReadRateLimit(request: { headers: Headers }) {
  return enforceRateLimit(request, {
    routeId: "public-catalog-read",
    max: 180,
    windowMs: ONE_MINUTE_MS,
  });
}

export function enforceCatalogSearchRateLimit(request: { headers: Headers }) {
  return enforceRateLimit(request, {
    routeId: "public-catalog-search",
    max: 60,
    windowMs: ONE_MINUTE_MS,
  });
}

export function enforceOrderTrackingRateLimit(request: { headers: Headers }) {
  return enforceRateLimit(request, {
    routeId: "public-order-tracking",
    max: 20,
    windowMs: ONE_MINUTE_MS,
  });
}
