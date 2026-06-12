"use client";

/**
 * axios بتاع الواجهة (BFF تحت `/api`)
 * بالعامية: كل طلبات المتجر من المتصفح تعدي هنا — بنحط التوكن، وبنخزن شوية GET في localStorage لو الشبكة وقعت نرجع آخر نجاح.
 *
 * ملاحظات:
 * - ليه كاش محلي: تجربة أوضح لكتالوج/تصنيفات لما السيرفر يبوّظ مؤقتاً؛ مش بديل أمان.
 * - حذر: الـ 401 على reviews العامة مش «انتهاء جلسة» — بنستثنيها عشان مفاتيح Woo الغلط ما تطردش المستخدم.
 * - شوف كمان: `@/features/auth/store/useAuthStore.ts`، `@/lib/storefront-offline-cache.ts`
 */
import axios, { type AxiosError, type AxiosResponse } from "axios";
import { ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import {
  canFallbackToCachedResponse,
  isStorefrontCacheableGet,
  storefrontApiCacheKey,
} from "@/lib/storefront-api-cache-policy";
import { isCommerceTrustRequest } from "@/lib/storefront-commerce-fetch";

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
  if (
    !canUseStorage() ||
    !isStorefrontCacheableGet(response.config) ||
    isCommerceTrustRequest(response.config)
  ) {
    return;
  }
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

/** حقن Bearer من الـ auth store قبل ما الطلب يطلع. */
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

/**
 * ردود ناجحة → نكتب كاش؛ أخطاء شبكة/502 → نجرب نقرا من localStorage؛ 401 → نفض الجلسة مع استثناءات واضحة.
 */
apiClient.interceptors.response.use(
  (res) => {
    writeStorefrontApiCache(res);
    return res;
  },
  (error: AxiosError) => {
    const config = error.config;
    if (
      canFallbackToCachedResponse(error) &&
      config &&
      !isCommerceTrustRequest(config)
    ) {
      const cached = readStorefrontApiCache(config);
      if (cached) {
        return Promise.resolve({
          data: cached.data,
          status: 200,
          statusText: "OK (cached)",
          headers: {
            ...cached.headers,
            "x-sokany-response-source": "cache-fallback",
          },
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
      /* GET عام لـ reviews ممكن 401 من Woo — ده مش انتهاء جلسة المتجر. */
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
