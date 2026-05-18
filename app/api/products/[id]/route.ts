/**
 * BFF: منتج واحد (رقم أو slug)
 * بالعامية: الـ segment في المسار ممكن يكون id Woo أو slug؛ بنجرب كاشات متعددة، وبعدين mock لو البيئة تقول كده.
 *
 * شوف كمان: `@/features/products/services/getProductByIdMeta.ts`
 */
import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { mockProducts } from "@/features/products/mock";
import { getSnapshotProducts } from "@/features/data-snapshot/server";
import { createWooClient } from "@/lib/create-woo-client";
import { API_NO_INDEX_HEADERS } from "@/lib/api-no-index";
import { wooBff502Response } from "@/lib/woo-bff-catch-payload";
import { shouldUseWooBffMockFallback } from "@/lib/woo-bff-mock-fallback";
import { WOO_BFF_UNSTABLE_CACHE_REVALIDATE_SEC } from "@/lib/woo-bff-revalidate";
import {
  wooProductDetailTag,
  wooProductSlugTag,
} from "@/lib/woocommerce-cache-tags";
import { enforceCatalogReadRateLimit } from "@/lib/public-api-rate-limit";
import type { WCProduct } from "@/features/products/types";

type RouteContext = { params: Promise<{ id: string }> };

function wooFetchMiss(e: unknown): null {
  if (shouldUseWooBffMockFallback(e)) throw e;
  return null;
}

function fetchWooProductByIdCached(id: string): Promise<WCProduct> {
  return unstable_cache(
    async (): Promise<WCProduct> => {
      const woo = await createWooClient();
      const response = await woo.get(`/products/${id}`);
      return response.data as WCProduct;
    },
    ["woo-api-product-by-id-v2", id],
    {
      revalidate: WOO_BFF_UNSTABLE_CACHE_REVALIDATE_SEC,
      tags: [wooProductDetailTag(id)],
    },
  )();
}

function fetchWooProductByIdFromCollectionCached(
  id: string,
): Promise<WCProduct | null> {
  return unstable_cache(
    async (): Promise<WCProduct | null> => {
      const woo = await createWooClient();
      const response = await woo.get("/products", {
        params: { include: id, per_page: "1" },
      });
      const rows = Array.isArray(response.data) ? response.data : [];
      return (rows[0] as WCProduct | undefined) ?? null;
    },
    ["woo-api-product-by-id-collection-v2", id],
    {
      revalidate: WOO_BFF_UNSTABLE_CACHE_REVALIDATE_SEC,
      tags: [wooProductDetailTag(id)],
    },
  )();
}

function fetchWooProductBySlugCached(slug: string): Promise<WCProduct | null> {
  return unstable_cache(
    async (): Promise<WCProduct | null> => {
      const woo = await createWooClient();
      const response = await woo.get("/products", {
        params: { slug, per_page: "1" },
      });
      const rows = Array.isArray(response.data) ? response.data : [];
      return (rows[0] as WCProduct | undefined) ?? null;
    },
    ["woo-api-product-by-slug-v2", slug],
    {
      revalidate: WOO_BFF_UNSTABLE_CACHE_REVALIDATE_SEC,
      tags: [wooProductSlugTag(slug)],
    },
  )();
}

export async function GET(request: NextRequest, context: RouteContext) {
  const limited = enforceCatalogReadRateLimit(request);
  if (limited) return limited;

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
      return NextResponse.json(
        { error: "Failed to fetch product" },
        { status: 404, headers: API_NO_INDEX_HEADERS },
      );
    }
    return NextResponse.json(body, { headers: API_NO_INDEX_HEADERS });
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
