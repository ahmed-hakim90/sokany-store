import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { mockCategories } from "@/features/categories/mock";
import { getSnapshotCategories } from "@/features/data-snapshot/server";
import { createWooClient } from "@/lib/create-woo-client";
import { USE_MOCK } from "@/lib/constants";
import { wooBff502Response } from "@/lib/woo-bff-catch-payload";
import {
  WOO_CACHE_TAG_PRODUCTS,
  WOO_CACHE_TAG_SITEMAP,
} from "@/lib/woocommerce-cache-tags";
import type { WCCategory } from "@/features/categories/types";

type RouteContext = { params: Promise<{ id: string }> };

const fetchWooCategoryByIdCached = unstable_cache(
  async (id: string): Promise<WCCategory> => {
    const woo = await createWooClient();
    const response = await woo.get(`/products/categories/${id}`);
    return response.data as WCCategory;
  },
  ["woo-api-category-by-id-v1"],
  { revalidate: 300, tags: [WOO_CACHE_TAG_PRODUCTS, WOO_CACHE_TAG_SITEMAP] },
);

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const data = await fetchWooCategoryByIdCached(id);
    return NextResponse.json(data);
  } catch (error) {
    if (!USE_MOCK) {
      return await wooBff502Response(error);
    }
    const source = getSnapshotCategories() ?? mockCategories;
    const raw = source.find((c) => String(c.id) === id);
    if (!raw) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json(raw);
  }
}
