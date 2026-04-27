import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { listMockProductsMatching } from "@/features/products/mock";
import { createWooClient } from "@/lib/create-woo-client";
import {
  getSnapshotCategories,
  getSnapshotProducts,
} from "@/features/data-snapshot/server";
import { mockCategories } from "@/features/categories/mock";
import { DEFAULT_PER_PAGE, USE_MOCK } from "@/lib/constants";
import { wooBff502Response } from "@/lib/woo-bff-catch-payload";
import { WOO_CACHE_TAG_PRODUCTS } from "@/lib/woocommerce-cache-tags";
import { filterWcProductsExcludingOutOfStock } from "@/lib/woo-storefront-availability";
import type { WCCategory } from "@/features/categories/types";
import type { WCProduct } from "@/features/products/types";

type CachedWooListResponse = {
  data: unknown;
  total: string;
  totalPages: string;
};

function collectDescendantCategoryIds(
  rootId: number,
  categories: WCCategory[],
): Set<number> {
  const byParent = new Map<number, WCCategory[]>();
  for (const category of categories) {
    const bucket = byParent.get(category.parent) ?? [];
    bucket.push(category);
    byParent.set(category.parent, bucket);
  }

  const ids = new Set<number>([rootId]);
  const queue = [rootId];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) continue;
    const children = byParent.get(current) ?? [];
    for (const child of children) {
      if (ids.has(child.id)) continue;
      ids.add(child.id);
      queue.push(child.id);
    }
  }
  return ids;
}

function filterProductsByCategorySet(
  products: WCProduct[],
  categoryIds: Set<number>,
): WCProduct[] {
  if (categoryIds.size === 0) return products;
  return products.filter((product) =>
    product.categories.some((category) => categoryIds.has(category.id)),
  );
}

const fetchWooProductsCached = unstable_cache(
  async (paramsKey: string): Promise<CachedWooListResponse> => {
    const woo = await createWooClient();
    const params = JSON.parse(paramsKey) as Record<string, string>;
    const response = await woo.get("/products", { params });
    const payload = response.data;
    return {
      data: Array.isArray(payload)
        ? filterWcProductsExcludingOutOfStock(payload)
        : payload,
      total: String(response.headers["x-wp-total"] ?? "0"),
      totalPages: String(response.headers["x-wp-totalpages"] ?? "1"),
    };
  },
  ["woo-api-products-v1"],
  { revalidate: 300, tags: [WOO_CACHE_TAG_PRODUCTS] },
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const cached = await fetchWooProductsCached(JSON.stringify(params));
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
    const page = Number(searchParams.get("page") ?? "1") || 1;
    const per_page =
      Number(searchParams.get("per_page") ?? String(DEFAULT_PER_PAGE)) ||
      DEFAULT_PER_PAGE;
    const includeChildren =
      searchParams.get("include_children") === "true";
    const featured =
      searchParams.get("featured") === "true" ? true : undefined;
    const search = searchParams.get("search")?.trim() || undefined;
    const catRaw = searchParams.get("category");
    let category: string | number | undefined;
    if (catRaw) {
      const asNum = Number.parseInt(catRaw, 10);
      category = Number.isFinite(asNum) ? asNum : catRaw;
    }
    const filterOpts = { featured, search };
    const sourceProducts = getSnapshotProducts() ?? undefined;
    const sourceCategories = getSnapshotCategories() ?? mockCategories;
    let all = listMockProductsMatching(filterOpts, sourceProducts);

    const includeRaw = searchParams.get("include")?.trim();
    if (includeRaw) {
      const order = includeRaw
        .split(",")
        .map((s) => Number.parseInt(s.trim(), 10))
        .filter((n) => Number.isFinite(n));
      const byId = new Map(all.map((p) => [p.id, p]));
      all = order
        .map((id) => byId.get(id))
        .filter((p): p is WCProduct => p != null);
    }

    if (!includeRaw && category !== undefined) {
      let categoryIds = new Set<number>();
      if (typeof category === "number") {
        categoryIds = includeChildren
          ? collectDescendantCategoryIds(category, sourceCategories)
          : new Set([category]);
      } else {
        const matched = sourceCategories.find((entry) => entry.slug === category);
        if (matched) {
          categoryIds = includeChildren
            ? collectDescendantCategoryIds(matched.id, sourceCategories)
            : new Set([matched.id]);
        }
      }

      if (categoryIds.size > 0) {
        all = filterProductsByCategorySet(all, categoryIds);
      } else {
        all = all.filter((product) =>
          product.categories.some(
            (entry) => entry.id === Number(category) || entry.slug === category,
          ),
        );
      }
    }

    all = filterWcProductsExcludingOutOfStock(all);

    const start = (page - 1) * per_page;
    const data = all.slice(start, start + per_page);
    return NextResponse.json(data, {
      headers: {
        "X-WP-Total": String(all.length),
        "X-WP-TotalPages": String(
          Math.max(1, Math.ceil(all.length / per_page)),
        ),
      },
    });
  }
}
