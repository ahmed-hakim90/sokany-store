import { NextRequest, NextResponse } from "next/server";
import { listMockProductsMatching } from "@/features/products/mock";
import { createWooClient } from "@/lib/create-woo-client";
import {
  getSnapshotCategories,
  getSnapshotProducts,
} from "@/features/data-snapshot/server";
import { mockCategories } from "@/features/categories/mock";
import { USE_MOCK } from "@/lib/constants";
import { wooBff502Response } from "@/lib/woo-bff-catch-payload";
import { filterWcProductsExcludingOutOfStock } from "@/lib/woo-storefront-availability";
import type { WCCategory } from "@/features/categories/types";
import type { WCProduct } from "@/features/products/types";

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const woo = await createWooClient();
    const params = Object.fromEntries(searchParams.entries());
    const response = await woo.get("/products", { params });
    const payload = response.data;
    // Drop ‎`outofstock`‎ only — ‎`onbackorder`‎ stays (matches ‎`mapProduct` ‎`inStock`‎).
    const data = Array.isArray(payload)
      ? filterWcProductsExcludingOutOfStock(payload)
      : payload;
    return NextResponse.json(data, {
      headers: {
        "X-WP-Total": String(response.headers["x-wp-total"] ?? "0"),
        "X-WP-TotalPages": String(response.headers["x-wp-totalpages"] ?? "1"),
      },
    });
  } catch (error) {
    if (!USE_MOCK) {
      return await wooBff502Response(error);
    }
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? "1") || 1;
    const per_page = Number(searchParams.get("per_page") ?? "12") || 12;
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
