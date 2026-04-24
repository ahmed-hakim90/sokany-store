import "server-only";

import { unstable_cache } from "next/cache";
import { createWooClient } from "@/lib/create-woo-client";
import { WOO_CACHE_TAG_PRODUCTS } from "@/lib/woocommerce-cache-tags";
import { wpProductsSchema } from "@/schemas/wordpress";
import type { ProductQueryParams } from "@/types";
import { filterWcProductsExcludingOutOfStock } from "@/lib/woo-storefront-availability";
import { mapProducts } from "../adapters";
import { filterMockProducts } from "../mock";
import type { Product, WCProduct } from "../types";

const fetchWooProductsForServer = unstable_cache(
  async (paramsKey: string) => {
    const params = (
      paramsKey ? JSON.parse(paramsKey) : undefined
    ) as ProductQueryParams | undefined;
    const woo = await createWooClient();
    const response = await woo.get("/products", {
      params: (params ?? {}) as Record<string, string | number | boolean | undefined>,
    });
    const raw = response.data as WCProduct[];
    return filterWcProductsExcludingOutOfStock(raw);
  },
  ["woo-server-products-raw-v2-instock-list"],
  { revalidate: 120, tags: [WOO_CACHE_TAG_PRODUCTS] },
);

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
    const paramsKey = JSON.stringify(params ?? {});
    const data = await fetchWooProductsForServer(paramsKey);
    return mapProducts(wpProductsSchema.parse(data));
  } catch {
    return mockProductsFromParams(params);
  }
}
