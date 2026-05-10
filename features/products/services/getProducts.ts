/**
 * كتالوج من `/api/products` (عميل)
 * بالعامية: TanStack Query وغيره بيستخدموا الطبقة دي؛ الهيدرز بتاعة `x-wp-total` بتفيد الباجينيشين.
 *
 * شوف كمان: `@/features/products/services/getProductsServer.ts` للسيرفر
 */
import { apiClient } from "@/lib/api";
import { DEFAULT_PER_PAGE } from "@/lib/constants";
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
  /** مصدر الاستجابة عند قراءة هيدر الـ API (كاش محلي بعد فشل الشبكة). */
  responseSource?: "network" | "cache-fallback";
};

export async function getProductsList(
  params?: ProductQueryParams,
): Promise<ProductsListResult> {
  const response = await apiClient.get("/products", {
    params: params as Record<string, string | number | boolean | undefined>,
  });
  const products = mapProducts(wpProductsSchema.parse(response.data));
  const h = response.headers;
  const total = parseWpTotalHeader(h["x-wp-total"] ?? h["X-WP-Total"], 0);
  const per = params?.per_page ?? DEFAULT_PER_PAGE;
  const totalPages = Math.max(
    1,
    parseWpTotalHeader(
      h["x-wp-totalpages"] ?? h["X-WP-TotalPages"],
      total > 0 ? Math.max(1, Math.ceil(total / per)) : 1,
    ),
  );
  const src = h["x-sokany-response-source"] ?? h["X-Sokany-Response-Source"];
  const responseSource =
    src === "cache-fallback" ? ("cache-fallback" as const) : ("network" as const);
  return { products, total, totalPages, responseSource };
}

export async function getProducts(
  params?: ProductQueryParams,
): Promise<Product[]> {
  const { products } = await getProductsList(params);
  return products;
}
