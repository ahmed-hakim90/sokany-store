import "server-only";
import { unstable_cache } from "next/cache";
import { USE_MOCK } from "@/lib/constants";
import { createWooClient } from "@/lib/create-woo-client";
import { mapCategory } from "@/features/categories/adapters";
import { mockCategories } from "@/features/categories/mock";
import { getSnapshotCategories } from "@/features/data-snapshot/server";
import {
  WOO_CACHE_TAG_PRODUCTS,
  WOO_CACHE_TAG_SITEMAP,
} from "@/lib/woocommerce-cache-tags";
import { wpCategoriesSchema, wpCategorySchema } from "@/schemas/wordpress";
import type { Category } from "@/features/categories/types";

const fetchWooCategoryBySlugMetaCached = unstable_cache(
  async (slug: string) => {
    const woo = await createWooClient();
    const res = await woo.get("/products/categories", {
      params: { slug, per_page: 1 },
    });
    return wpCategoriesSchema.parse(res.data)[0] ?? null;
  },
  ["woo-category-meta-by-slug-v1"],
  { revalidate: 300, tags: [WOO_CACHE_TAG_PRODUCTS, WOO_CACHE_TAG_SITEMAP] },
);

export async function getCategoryBySlugMeta(
  slug: string,
): Promise<Category | null> {
  const fallbackCategories = getSnapshotCategories() ?? mockCategories;
  if (USE_MOCK) {
    const raw = fallbackCategories.find((c) => c.slug === slug);
    return raw ? mapCategory(wpCategorySchema.parse(raw)) : null;
  }
  try {
    const first = await fetchWooCategoryBySlugMetaCached(slug);
    return first ? mapCategory(first) : null;
  } catch {
    if (!USE_MOCK) {
      return null;
    }
    const raw = fallbackCategories.find((c) => c.slug === slug);
    return raw ? mapCategory(wpCategorySchema.parse(raw)) : null;
  }
}
