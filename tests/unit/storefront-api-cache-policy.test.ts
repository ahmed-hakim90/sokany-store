import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { describe, expect, it } from "vitest";
import {
  canFallbackToCachedResponse,
  isStorefrontCacheableGet,
  normalizeApiPath,
  stableStringify,
  storefrontApiCacheKey,
} from "@/lib/storefront-api-cache-policy";

function cfg(partial: Partial<InternalAxiosRequestConfig>): InternalAxiosRequestConfig {
  return {
    ...partial,
    headers: {},
  } as InternalAxiosRequestConfig;
}

describe("storefrontApiCachePolicy", () => {
  it("stableStringify sorts object keys", () => {
    expect(stableStringify({ b: 1, a: 2 })).toBe(stableStringify({ a: 2, b: 1 }));
  });

  it("normalizeApiPath strips /api prefix", () => {
    expect(normalizeApiPath("/api/products?page=1")).toBe("/products");
  });

  it("isStorefrontCacheableGet allows catalog GETs", () => {
    expect(isStorefrontCacheableGet(cfg({ method: "get", url: "/api/products" }))).toBe(true);
    expect(isStorefrontCacheableGet(cfg({ method: "get", url: "/api/categories" }))).toBe(true);
    expect(isStorefrontCacheableGet(cfg({ method: "get", url: "/api/products/12" }))).toBe(true);
    expect(isStorefrontCacheableGet(cfg({ method: "post", url: "/api/products" }))).toBe(false);
  });

  it("storefrontApiCacheKey is stable for same path and params", () => {
    const a = storefrontApiCacheKey(cfg({ url: "/api/categories", params: { slug: "x" } }));
    const b = storefrontApiCacheKey(cfg({ url: "/api/categories", params: { slug: "x" } }));
    expect(a).toBe(b);
    expect(a.startsWith("sokany_storefront_api_response_v1:")).toBe(true);
  });

  it("canFallbackToCachedResponse for network errors and 502", () => {
    const noResponse = { config: cfg({}) } as AxiosError;
    expect(canFallbackToCachedResponse(noResponse)).toBe(true);

    const badGateway = {
      config: cfg({}),
      response: { status: 502 },
    } as AxiosError;
    expect(canFallbackToCachedResponse(badGateway)).toBe(true);

    const forbidden = {
      config: cfg({}),
      response: { status: 403 },
    } as AxiosError;
    expect(canFallbackToCachedResponse(forbidden)).toBe(false);
  });
});
