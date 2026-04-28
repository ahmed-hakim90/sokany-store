"use client";

import axios, { type AxiosError, type AxiosResponse } from "axios";
import { ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const STOREFRONT_API_CACHE_PREFIX = "sokany_storefront_api_response_v1:";
const STOREFRONT_API_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type CachedApiResponse = {
  cachedAt: number;
  data: unknown;
  headers: Record<string, string>;
};

export const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function stableStringify(value: unknown): string {
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

function normalizeApiPath(url: string | undefined): string {
  if (!url) return "";
  try {
    const parsed = new URL(url, "http://sokany.local");
    return parsed.pathname.replace(/^\/api/, "") || "/";
  } catch {
    return url.split("?")[0]?.replace(/^\/api/, "") || "";
  }
}

function isStorefrontCacheableGet(config: AxiosResponse["config"]): boolean {
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

function storefrontApiCacheKey(config: AxiosResponse["config"]): string {
  const path = normalizeApiPath(config.url);
  const params = stableStringify(config.params ?? {});
  return `${STOREFRONT_API_CACHE_PREFIX}${path}:${params}`;
}

function headersToRecord(headers: unknown): Record<string, string> {
  if (!headers || typeof headers !== "object") return {};
  const source =
    "toJSON" in headers && typeof headers.toJSON === "function"
      ? (headers.toJSON() as Record<string, unknown>)
      : (headers as Record<string, unknown>);
  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [key, String(value)]),
  );
}

function writeStorefrontApiCache(response: AxiosResponse): void {
  if (!canUseStorage() || !isStorefrontCacheableGet(response.config)) return;
  try {
    const cached: CachedApiResponse = {
      cachedAt: Date.now(),
      data: response.data,
      headers: headersToRecord(response.headers),
    };
    window.localStorage.setItem(
      storefrontApiCacheKey(response.config),
      JSON.stringify(cached),
    );
  } catch {
    /* Ignore storage quota/private mode. */
  }
}

function readStorefrontApiCache(
  config: AxiosResponse["config"] | undefined,
): CachedApiResponse | null {
  if (!config || !canUseStorage() || !isStorefrontCacheableGet(config)) return null;
  try {
    const key = storefrontApiCacheKey(config);
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const cached = JSON.parse(raw) as Partial<CachedApiResponse>;
    if (
      typeof cached.cachedAt !== "number" ||
      cached.data === undefined ||
      !cached.headers ||
      typeof cached.headers !== "object"
    ) {
      window.localStorage.removeItem(key);
      return null;
    }
    if (Date.now() - cached.cachedAt > STOREFRONT_API_CACHE_MAX_AGE_MS) {
      window.localStorage.removeItem(key);
      return null;
    }
    return cached as CachedApiResponse;
  } catch {
    return null;
  }
}

function canFallbackToCachedResponse(error: AxiosError): boolean {
  if (!error.config) return false;
  if (!error.response) return true;
  return [502, 503, 504].includes(error.response.status);
}

apiClient.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => {
    writeStorefrontApiCache(res);
    return res;
  },
  (error: AxiosError) => {
    const config = error.config;
    if (canFallbackToCachedResponse(error) && config) {
      const cached = readStorefrontApiCache(config);
      if (cached) {
        return Promise.resolve({
          data: cached.data,
          status: 200,
          statusText: "OK (cached)",
          headers: cached.headers,
          config,
          request: error.request,
        } satisfies AxiosResponse);
      }
    }

    if (error.response?.status === 401 && typeof window !== "undefined") {
      const url = error.config?.url ?? "";
      const method = (error.config?.method ?? "get").toLowerCase();
      if (
        url.includes("/auth/login") ||
        url.includes("/auth/firebase") ||
        url.includes("/auth/register") ||
        url.includes("/auth/logout")
      ) {
        return Promise.reject(error);
      }
      // Public GETs proxied to Woo can return 401 (bad/readonly keys, endpoint policy). That is not a storefront session expiry.
      if (
        method === "get" &&
        (url === "reviews" ||
          url.startsWith("reviews?") ||
          url.includes("/reviews"))
      ) {
        return Promise.reject(error);
      }
      useAuthStore.getState().clearAuth();
      if (window.location.pathname !== ROUTES.LOGIN) {
        window.location.assign(ROUTES.LOGIN);
      }
    }
    return Promise.reject(error);
  },
);
