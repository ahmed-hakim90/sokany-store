import { apiClient } from "@/lib/api";
import { wpCategoriesSchema } from "@/schemas/wordpress";
import { mapCategory } from "../adapters";
import type { Category } from "../types";

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const response = await apiClient.get("/categories", {
    params: { slug, per_page: 10 },
  });
  const parsed = wpCategoriesSchema.parse(response.data);
  const raw = parsed.find((category) => category.slug === slug) ?? parsed[0];
  return raw ? mapCategory(raw) : null;
}
