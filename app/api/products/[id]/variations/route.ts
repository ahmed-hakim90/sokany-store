import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { createWooClient } from "@/lib/create-woo-client";
import { API_NO_INDEX_HEADERS } from "@/lib/api-no-index";
import { wooBff502Response } from "@/lib/woo-bff-catch-payload";
import { shouldUseWooBffMockFallback } from "@/lib/woo-bff-mock-fallback";
import { WOO_BFF_UNSTABLE_CACHE_REVALIDATE_SEC } from "@/lib/woo-bff-revalidate";
import { wooProductDetailTag } from "@/lib/woocommerce-cache-tags";
import { enforceCatalogReadRateLimit } from "@/lib/public-api-rate-limit";
import { COMMERCE_TRUST_HEADER } from "@/lib/storefront-commerce-fetch";

type RouteContext = { params: Promise<{ id: string }> };

function fetchWooVariationsCached(productId: string): Promise<unknown[]> {
  return unstable_cache(
    async (): Promise<unknown[]> => {
      const woo = await createWooClient();
      const response = await woo.get(`/products/${productId}/variations`, {
        params: { per_page: 100 },
      });
      return Array.isArray(response.data) ? response.data : [];
    },
    ["woo-api-product-variations-v1", productId],
    {
      revalidate: WOO_BFF_UNSTABLE_CACHE_REVALIDATE_SEC,
      tags: [wooProductDetailTag(productId)],
    },
  )();
}

export async function GET(request: NextRequest, context: RouteContext) {
  const limited = enforceCatalogReadRateLimit(request);
  if (limited) return limited;

  const { id } = await context.params;
  const productId = id.trim();
  if (!/^\d+$/.test(productId)) {
    return NextResponse.json(
      { error: "Invalid product id" },
      { status: 400, headers: API_NO_INDEX_HEADERS },
    );
  }

  const commerceTrust =
    request.headers.get(COMMERCE_TRUST_HEADER) === "1";

  try {
    let body: unknown[];
    if (commerceTrust) {
      const woo = await createWooClient();
      const response = await woo.get(`/products/${productId}/variations`, {
        params: { per_page: 100 },
      });
      body = Array.isArray(response.data) ? response.data : [];
    } else {
      body = await fetchWooVariationsCached(productId);
    }

    return NextResponse.json(body, {
      headers: {
        ...API_NO_INDEX_HEADERS,
        ...(commerceTrust ? { "Cache-Control": "no-store" } : {}),
      },
    });
  } catch (error) {
    if (!shouldUseWooBffMockFallback(error)) {
      return await wooBff502Response(error);
    }
    return NextResponse.json([], { headers: API_NO_INDEX_HEADERS });
  }
}
