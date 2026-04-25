import "server-only";

import { unstable_cache } from "next/cache";
import { WOO_CACHE_TAG_PRODUCTS, WOO_CACHE_TAG_SITEMAP } from "@/lib/woocommerce-cache-tags";
import { mockCategories } from "@/features/categories/mock";
import { mockProducts } from "@/features/products/mock";
import {
  getSnapshotCategories,
  getSnapshotProducts,
} from "@/features/data-snapshot/server";
import { USE_MOCK } from "@/lib/constants";
import { createWooClient } from "@/lib/create-woo-client";
import { isWcProductOutOfStockOnly } from "@/lib/woo-storefront-availability";
import { wpCategoriesSchema, wpProductsSchema } from "@/schemas/wordpress";

const PER_PAGE = 100;
/** Safety cap — adjust if the catalog grows beyond ~50k published products. */
const MAX_PRODUCT_PAGES = 500;

const fetchSitemapFromWoo = unstable_cache(
  async (): Promise<{
    productIds: number[];
    categorySlugs: string[];
  }> => {
    const woo = await createWooClient();
    const productIds: number[] = [];
    for (let page = 1; page <= MAX_PRODUCT_PAGES; page += 1) {
      const res = await woo.get("/products", {
        params: { per_page: PER_PAGE, page, status: "publish" },
      });
      const batch = wpProductsSchema.parse(res.data);
      if (batch.length === 0) break;
      for (const p of batch) {
        if (!isWcProductOutOfStockOnly(p)) {
          productIds.push(p.id);
        }
      }
      if (batch.length < PER_PAGE) break;
    }

    const categorySlugs: string[] = [];
    for (let page = 1; page <= 100; page += 1) {
      const res = await woo.get("/products/categories", {
        params: { per_page: PER_PAGE, page, hide_empty: false },
      });
      const batch = wpCategoriesSchema.parse(res.data);
      if (batch.length === 0) break;
      for (const c of batch) {
        if (c.slug) categorySlugs.push(c.slug);
      }
      if (batch.length < PER_PAGE) break;
    }

    return {
      productIds,
      categorySlugs: Array.from(new Set(categorySlugs)),
    };
  },
  ["woo-sitemap-inventory-v1"],
  { revalidate: 600, tags: [WOO_CACHE_TAG_SITEMAP, WOO_CACHE_TAG_PRODUCTS] },
);

/**
 * Product IDs and category slugs for `app/sitemap.ts`.
 * Uses WooCommerce when live; falls back to snapshot JSON or hand mocks.
 */
export async function getSitemapInventory(): Promise<{
  productIds: number[];
  categorySlugs: string[];
}> {
  const fallbackProducts = getSnapshotProducts() ?? mockProducts;
  const fallbackCategories = getSnapshotCategories() ?? mockCategories;

  if (USE_MOCK) {
    return {
      productIds: fallbackProducts
        .filter((p) => !isWcProductOutOfStockOnly(p))
        .map((p) => p.id),
      categorySlugs: Array.from(
        new Set(fallbackCategories.map((c) => c.slug).filter(Boolean)),
      ),
    };
  }

  try {
    return await fetchSitemapFromWoo();
  } catch {
    if (!USE_MOCK) {
      return { productIds: [], categorySlugs: [] };
    }
    return {
      productIds: fallbackProducts
        .filter((p) => !isWcProductOutOfStockOnly(p))
        .map((p) => p.id),
      categorySlugs: Array.from(
        new Set(fallbackCategories.map((c) => c.slug).filter(Boolean)),
      ),
    };
  }
}
