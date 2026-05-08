import "server-only";

import { unstable_cache } from "next/cache";
import { createWooClient } from "@/lib/create-woo-client";
import { WOO_CACHE_TAG_PRODUCT_TAGS } from "@/lib/woocommerce-cache-tags";
import { wpWooProductTagsListResponseSchema } from "@/schemas/wordpress";

const PER_PAGE = 100;
const MAX_PAGES = 3;

export type WooProductTagSuggestion = {
  name: string;
  slug: string;
  count: number;
};

async function fetchWooProductTagsByProductCountUncached(): Promise<WooProductTagSuggestion[]> {
  const woo = await createWooClient();
  const out: WooProductTagSuggestion[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const res = await woo.get("/products/tags", {
      params: {
        page,
        per_page: PER_PAGE,
        orderby: "count",
        order: "desc",
        hide_empty: true,
      },
    });
    const rows = wpWooProductTagsListResponseSchema.parse(res.data);
    for (const t of rows) {
      const name = t.name.trim();
      if (!name) continue;
      out.push({
        name,
        slug: String(t.slug ?? "").trim(),
        count: Number.isFinite(t.count) ? t.count : 0,
      });
    }
    if (rows.length < PER_PAGE) break;
  }
  return out;
}

/**
 * وسوم Woo مرتبة تنازليًا بعدد المنتجات — للاقتراحات في لوحة التحكم فقط.
 * كاش قصير يقلّل الضغط على Woo عند فتح القسم أكثر من مرة.
 */
export const fetchCachedWooProductTagsByProductCount = unstable_cache(
  fetchWooProductTagsByProductCountUncached,
  ["woo-product-tags-by-count-v1"],
  { revalidate: 600, tags: [WOO_CACHE_TAG_PRODUCT_TAGS] },
);
