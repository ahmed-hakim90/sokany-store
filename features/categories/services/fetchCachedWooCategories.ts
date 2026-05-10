import "server-only";

/**
 * تصنيفات Woo مع `unstable_cache`
 * بالعامية: نفس إعدادات الكاش اللي في `/api/categories` علشان RSC والـ route ما يضربوش Woo مرتين بمنطق مختلف.
 *
 * شوف كمان: `@/app/api/categories/route.ts`، `@/lib/woocommerce-cache-tags.ts`
 */
import { unstable_cache } from "next/cache";
import { createWooClient } from "@/lib/create-woo-client";
import { WOO_BFF_UNSTABLE_CACHE_REVALIDATE_SEC } from "@/lib/woo-bff-revalidate";
import {
  WOO_CACHE_TAG_PRODUCTS,
  WOO_CACHE_TAG_SITEMAP,
} from "@/lib/woocommerce-cache-tags";

type CachedWooCategoriesResponse = {
  data: unknown;
  total: string;
  totalPages: string;
};

export const fetchCachedWooCategories = unstable_cache(
  async (paramsKey: string): Promise<CachedWooCategoriesResponse> => {
    const woo = await createWooClient();
    const params = JSON.parse(paramsKey) as Record<string, string>;
    const response = await woo.get("/products/categories", { params });
    return {
      data: response.data,
      total: String(response.headers["x-wp-total"] ?? "0"),
      totalPages: String(response.headers["x-wp-totalpages"] ?? "1"),
    };
  },
  ["woo-api-categories-v1"],
  {
    revalidate: WOO_BFF_UNSTABLE_CACHE_REVALIDATE_SEC,
    tags: [WOO_CACHE_TAG_PRODUCTS, WOO_CACHE_TAG_SITEMAP],
  },
);
