import { apiClient } from "@/lib/api";
import { wpProductsSchema } from "@/schemas/wordpress";
import type { ProductQueryParams } from "@/types";
import { mapProducts } from "../adapters";
import type { Product } from "../types";

export async function getProducts(
  params?: ProductQueryParams,
): Promise<Product[]> {
  const response = await apiClient.get("/products", {
    params: params as Record<string, string | number | boolean | undefined>,
  });
  return mapProducts(wpProductsSchema.parse(response.data));
}
