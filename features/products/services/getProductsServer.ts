import "server-only";

/**
 * كتالوج منتجات للـ RSC
 * بالعامية: نفس منطق `/api/products` تقريباً — `unstable_cache` + تاجات Woo علشان الصفحات السيرفرية تبقى سريعة ومتماشية مع الـ BFF.
 *
 * ملاحظات:
 * - لو Woo فشل بنرجع mock/snapshot من `catch` — سلوك ناعم للـ build والمعاينة.
 * - شوف كمان: `@/features/products/services/woo-storefront-product-page.ts`، `@/app/api/products/route.ts`
 */
import { unstable_cache } from "next/cache";
import { createWooClient } from "@/lib/create-woo-client";
import { DEFAULT_PER_PAGE } from "@/lib/constants";
import { WOO_BFF_UNSTABLE_CACHE_REVALIDATE_SEC } from "@/lib/woo-bff-revalidate";
import { WOO_CACHE_TAG_PRODUCTS } from "@/lib/woocommerce-cache-tags";
import { wpProductsSchema } from "@/schemas/wordpress";
import type { ProductQueryParams } from "@/types";
import {
  fetchWooStorefrontProductsPage,
  productQueryParamsToRecord,
} from "@/features/products/services/woo-storefront-product-page";
import { mapProducts } from "../adapters";
import { filterMockProducts } from "../mock";
import type { ProductsListResult } from "./getProducts";
import type { Product, WCProduct } from "../types";

function parseWpTotalHeader(
  v: string | number | boolean | undefined,
  fallback: number,
) {
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

const fetchWooProductsListCached = unstable_cache(
  async (paramsKey: string) => {
    const params = (
      paramsKey ? JSON.parse(paramsKey) : undefined
    ) as ProductQueryParams | undefined;
    const woo = await createWooClient();
    const record = productQueryParamsToRecord(params);
    const { data, total, totalPages } = await fetchWooStorefrontProductsPage(
      woo,
      record,
    );
    return {
      data: data as WCProduct[],
      total,
      totalPages,
    };
  },
  ["woo-server-products-list-v1"],
  /** نفس زمن إبطال `/api/products` علشان RSC والـ API ما يختلفوش في العمر. */
  { revalidate: WOO_BFF_UNSTABLE_CACHE_REVALIDATE_SEC, tags: [WOO_CACHE_TAG_PRODUCTS] },
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
    on_sale: params?.on_sale === true ? true : undefined,
    page,
    per_page,
  });
  return mapProducts(wpProductsSchema.parse(raw));
}

export async function getProductsListServer(
  params?: ProductQueryParams,
): Promise<ProductsListResult> {
  try {
    const paramsKey = JSON.stringify(params ?? {});
    const { data, total, totalPages } =
      await fetchWooProductsListCached(paramsKey);
    const products = mapProducts(wpProductsSchema.parse(data));
    const totalNum = parseWpTotalHeader(total, products.length);
    const per = params?.per_page ?? DEFAULT_PER_PAGE;
    const totalPagesNum = Math.max(
      1,
      parseWpTotalHeader(
        totalPages,
        totalNum > 0 ? Math.max(1, Math.ceil(totalNum / per)) : 1,
      ),
    );
    return { products, total: totalNum, totalPages: totalPagesNum };
  } catch {
    const products = mockProductsFromParams(params);
    return {
      products,
      total: products.length,
      totalPages: 1,
    };
  }
}

export async function getProductsServer(
  params?: ProductQueryParams,
): Promise<Product[]> {
  const { products } = await getProductsListServer(params);
  return products;
}
