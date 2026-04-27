import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { mockCategories } from "@/features/categories/mock";
import { createWooClient } from "@/lib/create-woo-client";
import { getSnapshotCategories } from "@/features/data-snapshot/server";
import { USE_MOCK } from "@/lib/constants";
import { wooBff502Response } from "@/lib/woo-bff-catch-payload";
import {
  WOO_CACHE_TAG_PRODUCTS,
  WOO_CACHE_TAG_SITEMAP,
} from "@/lib/woocommerce-cache-tags";

type CachedWooListResponse = {
  data: unknown;
  total: string;
  totalPages: string;
};

const fetchWooCategoriesCached = unstable_cache(
  async (paramsKey: string): Promise<CachedWooListResponse> => {
    const woo = await createWooClient();
    const params = JSON.parse(paramsKey) as Record<string, string>;
    const response = await woo.get("/products/categories", { params });
    return {
      data: response.data,
      total: String(response.headers["x-wp-total"] ?? "0"),
      totalPages: String(response.headers["x-wp-totalpages"] ?? "1"),
    };
  },
  ["woo-api-categories-v1"],
  { revalidate: 300, tags: [WOO_CACHE_TAG_PRODUCTS, WOO_CACHE_TAG_SITEMAP] },
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const cached = await fetchWooCategoriesCached(JSON.stringify(params));
    return NextResponse.json(cached.data, {
      headers: {
        "X-WP-Total": cached.total,
        "X-WP-TotalPages": cached.totalPages,
      },
    });
  } catch (error) {
    if (!USE_MOCK) {
      return await wooBff502Response(error);
    }
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const sourceCategories = getSnapshotCategories() ?? mockCategories;
    const data = slug
      ? sourceCategories.filter((c) => c.slug === slug)
      : sourceCategories;
    return NextResponse.json(data, {
      headers: {
        "X-WP-Total": String(data.length),
        "X-WP-TotalPages": "1",
      },
    });
  }
}
