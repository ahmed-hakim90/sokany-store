import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { mockProducts } from "@/features/products/mock";
import { getSnapshotProducts } from "@/features/data-snapshot/server";
import { createWooClient } from "@/lib/create-woo-client";
import { USE_MOCK } from "@/lib/constants";
import { wooBff502Response } from "@/lib/woo-bff-catch-payload";
import { WOO_CACHE_TAG_PRODUCTS } from "@/lib/woocommerce-cache-tags";
import { isWcProductOutOfStockOnly } from "@/lib/woo-storefront-availability";
import type { WCProduct } from "@/features/products/types";

type RouteContext = { params: Promise<{ id: string }> };

const fetchWooProductByIdCached = unstable_cache(
  async (id: string): Promise<WCProduct> => {
    const woo = await createWooClient();
    const response = await woo.get(`/products/${id}`);
    return response.data as WCProduct;
  },
  ["woo-api-product-by-id-v1"],
  { revalidate: 300, tags: [WOO_CACHE_TAG_PRODUCTS] },
);

const fetchWooProductByIdFromCollectionCached = unstable_cache(
  async (id: string): Promise<WCProduct | null> => {
    const woo = await createWooClient();
    const response = await woo.get("/products", {
      params: { include: id, per_page: "1" },
    });
    const rows = Array.isArray(response.data) ? response.data : [];
    return (rows[0] as WCProduct | undefined) ?? null;
  },
  ["woo-api-product-by-id-collection-v1"],
  { revalidate: 300, tags: [WOO_CACHE_TAG_PRODUCTS] },
);

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const body =
      (await fetchWooProductByIdCached(id).catch(() => null)) ??
      (await fetchWooProductByIdFromCollectionCached(id).catch(() => null));
    if (!body) {
      return NextResponse.json({ error: "Failed to fetch product" }, { status: 404 });
    }
    if (isWcProductOutOfStockOnly(body)) {
      return NextResponse.json({ error: "Product not available" }, { status: 404 });
    }
    return NextResponse.json(body);
  } catch (error) {
    if (!USE_MOCK) {
      return await wooBff502Response(error);
    }
    const fallbackProducts = getSnapshotProducts() ?? mockProducts;
    const raw = fallbackProducts.find((p) => String(p.id) === id);
    if (!raw) {
      return NextResponse.json(
        { error: "Failed to fetch product" },
        { status: 404 },
      );
    }
    if (isWcProductOutOfStockOnly(raw)) {
      return NextResponse.json(
        { error: "Product not available" },
        { status: 404 },
      );
    }
    return NextResponse.json(raw);
  }
}
