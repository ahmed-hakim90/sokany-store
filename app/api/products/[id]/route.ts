import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { mockProducts } from "@/features/products/mock";
import { getSnapshotProducts } from "@/features/data-snapshot/server";
import { createWooClient } from "@/lib/create-woo-client";
import { wooBff502Response } from "@/lib/woo-bff-catch-payload";
import { shouldUseWooBffMockFallback } from "@/lib/woo-bff-mock-fallback";
import { WOO_CACHE_TAG_PRODUCTS } from "@/lib/woocommerce-cache-tags";
import type { WCProduct } from "@/features/products/types";

type RouteContext = { params: Promise<{ id: string }> };

function wooFetchMiss(e: unknown): null {
  if (shouldUseWooBffMockFallback(e)) throw e;
  return null;
}

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

const fetchWooProductBySlugCached = unstable_cache(
  async (slug: string): Promise<WCProduct | null> => {
    const woo = await createWooClient();
    const response = await woo.get("/products", {
      params: { slug, per_page: "1" },
    });
    const rows = Array.isArray(response.data) ? response.data : [];
    return (rows[0] as WCProduct | undefined) ?? null;
  },
  ["woo-api-product-by-slug-v1"],
  { revalidate: 300, tags: [WOO_CACHE_TAG_PRODUCTS] },
);

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const segment = id.trim();
  try {
    let body: WCProduct | null = null;
    if (/^\d+$/.test(segment)) {
      body =
        (await fetchWooProductByIdCached(segment).catch(wooFetchMiss)) ??
        (await fetchWooProductByIdFromCollectionCached(segment).catch(
          wooFetchMiss,
        ));
    } else if (segment.length > 0) {
      body = await fetchWooProductBySlugCached(segment).catch(wooFetchMiss);
    }

    if (!body) {
      return NextResponse.json({ error: "Failed to fetch product" }, { status: 404 });
    }
    return NextResponse.json(body);
  } catch (error) {
    if (!shouldUseWooBffMockFallback(error)) {
      return await wooBff502Response(error);
    }
    const fallbackProducts = getSnapshotProducts() ?? mockProducts;
    const raw =
      /^\d+$/.test(segment)
        ? fallbackProducts.find((p) => String(p.id) === segment)
        : fallbackProducts.find((p) => p.slug === segment);
    if (!raw) {
      return NextResponse.json(
        { error: "Failed to fetch product" },
        { status: 404 },
      );
    }
    return NextResponse.json(raw);
  }
}
