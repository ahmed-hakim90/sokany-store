import "server-only";

import { createWooClient } from "@/lib/create-woo-client";
import { wpProductsSchema } from "@/schemas/wordpress";
import type { ProductQueryParams } from "@/types";
import { mapProducts } from "../adapters";
import { filterMockProducts } from "../mock";
import type { Product } from "../types";

function mockProductsFromParams(params?: ProductQueryParams): Product[] {
  const page = params?.page ?? 1;
  const per_page = params?.per_page ?? 12;
  const featured = params?.featured === true ? true : undefined;
  const search = params?.search?.trim() || undefined;
  const category = params?.category;
  const raw = filterMockProducts({
    category,
    featured,
    search,
    page,
    per_page,
  });
  return mapProducts(wpProductsSchema.parse(raw));
}

export async function getProductsServer(
  params?: ProductQueryParams,
): Promise<Product[]> {
  try {
    const woo = createWooClient();
    const response = await woo.get("/products", {
      params: params as Record<string, string | number | boolean | undefined>,
    });
    return mapProducts(wpProductsSchema.parse(response.data));
  } catch {
    return mockProductsFromParams(params);
  }
}
