/**
 * منطق كاش الـ BFF في المتصفح — دوال نقية للاختبار ومشاركة السياسة مع ‎`api-client`‎.
 */
import type { AxiosError, AxiosResponse } from "axios";

export function stableStringify(value: unknown): string {
  if (value == null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .filter((key) => record[key] !== undefined)
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}

export function normalizeApiPath(url: string | undefined): string {
  if (!url) return "";
  try {
    const parsed = new URL(url, "http://sokany.local");
    return parsed.pathname.replace(/^\/api/, "") || "/";
  } catch {
    return url.split("?")[0]?.replace(/^\/api/, "") || "";
  }
}

export function isStorefrontCacheableGet(config: AxiosResponse["config"]): boolean {
  const method = (config.method ?? "get").toLowerCase();
  if (method !== "get") return false;
  const path = normalizeApiPath(config.url);
  return (
    path === "/products" ||
    /^\/products\/\d+$/.test(path) ||
    path === "/categories" ||
    /^\/categories\/\d+$/.test(path) ||
    path === "/reviews"
  );
}

export function storefrontApiCacheKey(config: AxiosResponse["config"]): string {
  const path = normalizeApiPath(config.url);
  const params = stableStringify(config.params ?? {});
  return `sokany_storefront_api_response_v1:${path}:${params}`;
}

/** يمسح إدخالات كاش GET المحفوظة في localStorage للمسارات المطابقة. */
export function clearStorefrontApiCacheForPathPrefix(pathPrefix: string): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  const needle = `:${pathPrefix}`;
  const keysToRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (key?.startsWith("sokany_storefront_api_response_v1") && key.includes(needle)) {
      keysToRemove.push(key);
    }
  }
  for (const key of keysToRemove) {
    window.localStorage.removeItem(key);
  }
}

export function clearStorefrontApiCacheForProduct(productId: number): void {
  clearStorefrontApiCacheForPathPrefix(`/products/${productId}`);
}

export function clearStorefrontApiCacheForCatalog(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key?.startsWith("sokany_storefront_api_response_v1")) continue;
    if (
      key.includes(":/products") ||
      key.includes(":/categories") ||
      key.includes(":/reviews")
    ) {
      keysToRemove.push(key);
    }
  }
  for (const key of keysToRemove) {
    window.localStorage.removeItem(key);
  }
}

export function canFallbackToCachedResponse(error: AxiosError): boolean {
  if (!error.config) return false;
  if (!error.response) return true;
  return [502, 503, 504].includes(error.response.status);
}
