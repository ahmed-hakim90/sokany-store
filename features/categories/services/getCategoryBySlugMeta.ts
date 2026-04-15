import "server-only";
import { USE_MOCK } from "@/lib/constants";
import { createWooClient } from "@/lib/create-woo-client";
import { mapCategory } from "@/features/categories/adapters";
import { mockCategories } from "@/features/categories/mock";
import { wpCategoriesSchema, wpCategorySchema } from "@/schemas/wordpress";
import type { Category } from "@/features/categories/types";

export async function getCategoryBySlugMeta(
  slug: string,
): Promise<Category | null> {
  if (USE_MOCK) {
    const raw = mockCategories.find((c) => c.slug === slug);
    return raw ? mapCategory(wpCategorySchema.parse(raw)) : null;
  }
  try {
    const woo = createWooClient();
    const res = await woo.get("/products/categories", {
      params: { slug, per_page: 1 },
    });
    const first = wpCategoriesSchema.parse(res.data)[0];
    return first ? mapCategory(first) : null;
  } catch {
    const raw = mockCategories.find((c) => c.slug === slug);
    return raw ? mapCategory(wpCategorySchema.parse(raw)) : null;
  }
}
