import { apiClient } from "@/lib/api";
import { wpProductsSchema } from "@/schemas/wordpress";
import type { ProductQueryParams } from "@/types";
import { mapProducts } from "../adapters";
import type { Product } from "../types";

function parseWpTotalHeader(
  v: string | number | boolean | undefined,
  fallback: number,
) {
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export type ProductsListResult = {
  products: Product[];
  total: number;
  totalPages: number;
};

/**
 * Fetches a page of products plus ‎`X-WP-Total` / ‎`X-WP-TotalPages` (from the Next ‎`/api/products` route).
 */
export async function getProductsList(
  params?: ProductQueryParams,
): Promise<ProductsListResult> {
  const response = await apiClient.get("/products", {
    params: params as Record<string, string | number | boolean | undefined>,
  });
  const products = mapProducts(wpProductsSchema.parse(response.data));
  const h = response.headers;
  const total = parseWpTotalHeader(h["x-wp-total"] ?? h["X-WP-Total"], 0);
  const per = params?.per_page ?? 12;
  const totalPages = Math.max(
    1,
    parseWpTotalHeader(
      h["x-wp-totalpages"] ?? h["X-WP-TotalPages"],
      total > 0 ? Math.max(1, Math.ceil(total / per)) : 1,
    ),
  );
  return { products, total, totalPages };
}

export async function getProducts(
  params?: ProductQueryParams,
): Promise<Product[]> {
  const { products } = await getProductsList(params);
  return products;
}
