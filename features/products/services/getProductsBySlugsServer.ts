import "server-only";

import { unstable_cache } from "next/cache";
import { createWooClient } from "@/lib/create-woo-client";
import { WOO_CACHE_TAG_PRODUCTS } from "@/lib/woocommerce-cache-tags";
import { filterWcProductsExcludingOutOfStock } from "@/lib/woo-storefront-availability";
import { getSnapshotProducts } from "@/features/data-snapshot/server";
import { mockProducts } from "@/features/products/mock";
import { mapProducts } from "@/features/products/adapters";
import { wpProductsSchema } from "@/schemas/wordpress";
import type { Product, WCProduct } from "@/features/products/types";

const MAX_POST_PRODUCTS = 12;

const fetchWooProductsBySlugsCached = unstable_cache(
  async (slugsKey: string): Promise<WCProduct[]> => {
    const slugs = JSON.parse(slugsKey) as string[];
    if (slugs.length === 0) return [];
    const woo = await createWooClient();
    const rows = await Promise.all(
      slugs.map(async (slug) => {
        const res = await woo.get("/products", {
          params: { slug, per_page: "1", page: "1" },
        });
        const data = Array.isArray(res.data) ? res.data : [];
        return data[0] as WCProduct | undefined;
      }),
    );
    return filterWcProductsExcludingOutOfStock(rows.filter((p): p is WCProduct => p != null));
  },
  ["woo-products-by-slugs-v1"],
  { revalidate: 300, tags: [WOO_CACHE_TAG_PRODUCTS] },
);

function normalizeSlugs(slugs: readonly string[]): string[] {
  return Array.from(
    new Set(
      slugs
        .map((slug) => slug.trim())
        .filter((slug) => /^[a-z0-9][a-z0-9_-]*$/i.test(slug)),
    ),
  ).slice(0, MAX_POST_PRODUCTS);
}

export async function getProductsBySlugsServer(slugs: readonly string[]): Promise<Product[]> {
  const normalized = normalizeSlugs(slugs);
  if (normalized.length === 0) return [];

  try {
    const raw = await fetchWooProductsBySlugsCached(JSON.stringify(normalized));
    return mapProducts(wpProductsSchema.parse(raw));
  } catch {
    const fallbackProducts = getSnapshotProducts() ?? mockProducts;
    const bySlug = new Map(fallbackProducts.map((p) => [p.slug, p]));
    const raw = normalized
      .map((slug) => bySlug.get(slug))
      .filter((product): product is (typeof fallbackProducts)[number] => product != null);
    return mapProducts(wpProductsSchema.parse(raw));
  }
}
