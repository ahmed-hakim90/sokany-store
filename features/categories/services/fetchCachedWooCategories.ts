import "server-only";

import { unstable_cache } from "next/cache";
import { createWooClient } from "@/lib/create-woo-client";
import {
  WOO_CACHE_TAG_PRODUCTS,
  WOO_CACHE_TAG_SITEMAP,
} from "@/lib/woocommerce-cache-tags";

type CachedWooCategoriesResponse = {
  data: unknown;
  total: string;
  totalPages: string;
};

/**
 * يطابق مسار ‎`/api/categories`‎ — نفس وسوم الكاش و‎`revalidate`‎ حتى يُستَخدم من الـ RSC والـ route معاً.
 */
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
  { revalidate: 300, tags: [WOO_CACHE_TAG_PRODUCTS, WOO_CACHE_TAG_SITEMAP] },
);
