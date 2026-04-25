import { apiClient } from "@/lib/api";
import { wpCategoriesSchema } from "@/schemas/wordpress";
import type { CategoryQueryParams } from "@/types";
import { mapCategories } from "../adapters";
import type { Category } from "../types";

export async function getCategories(
  params?: CategoryQueryParams,
): Promise<Category[]> {
  const response = await apiClient.get("/categories", {
    params: params as Record<string, string | number | boolean | undefined>,
  });
  return mapCategories(wpCategoriesSchema.parse(response.data));
}
