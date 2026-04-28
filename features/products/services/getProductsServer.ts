import "server-only";

import { unstable_cache } from "next/cache";
import { createWooClient } from "@/lib/create-woo-client";
import { DEFAULT_PER_PAGE } from "@/lib/constants";
import { WOO_CACHE_TAG_PRODUCTS } from "@/lib/woocommerce-cache-tags";
import { wpProductsSchema } from "@/schemas/wordpress";
import type { ProductQueryParams } from "@/types";
import {
  fetchWooStorefrontProductsPage,
  productQueryParamsToRecord,
} from "@/features/products/services/woo-storefront-product-page";
import { mapProducts } from "../adapters";
import { filterMockProducts } from "../mock";
import type { Product, WCProduct } from "../types";

const fetchWooProductsForServer = unstable_cache(
  async (paramsKey: string) => {
    const params = (
      paramsKey ? JSON.parse(paramsKey) : undefined
    ) as ProductQueryParams | undefined;
    const woo = await createWooClient();
    const record = productQueryParamsToRecord(params);
    const { data } = await fetchWooStorefrontProductsPage(woo, record);
    return data as WCProduct[];
  },
  ["woo-server-products-v3-storefront-walk"],
  { revalidate: 120, tags: [WOO_CACHE_TAG_PRODUCTS] },
);

function mockProductsFromParams(params?: ProductQueryParams): Product[] {
  const page = params?.page ?? 1;
  const per_page = params?.per_page ?? DEFAULT_PER_PAGE;
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
