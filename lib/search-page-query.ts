import type { ProductQueryParams } from "@/types";
import { DEFAULT_PER_PAGE } from "@/lib/constants";
import {
  normalizeSearchParamQ,
  resolveSearchPageQuery,
} from "@/schemas/search";

function first(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function parsePositiveInt(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function parseNonNegativeInt(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/**
 * يقرأ `q` ومعاملات الكتالوج من `search` على الخادم لصفحة `/search`.
 */
export function buildProductQueryFromSearchPageSearchParams(
  sp: Record<string, string | string[] | undefined>,
): {
  query: string;
  searched: boolean;
  productParams: ProductQueryParams;
} {
  const rawQ = normalizeSearchParamQ(sp.q);
  const q = resolveSearchPageQuery(rawQ);
  const searched = q.length >= 3;

  const orderRaw = first(sp.order);
  const order =
    orderRaw === "asc" || orderRaw === "desc" ? orderRaw : undefined;
  const orderbyRaw = first(sp.orderby);
  const orderby =
    orderbyRaw &&
    ["date", "popularity", "price", "rating", "title"].includes(orderbyRaw)
      ? orderbyRaw
      : undefined;

  const productParams: ProductQueryParams = {
    page: parsePositiveInt(first(sp.page)) ?? 1,
    per_page: parsePositiveInt(first(sp.per_page)) ?? DEFAULT_PER_PAGE,
    category: parsePositiveInt(first(sp.category)),
    featured: first(sp.featured) === "true" ? true : undefined,
    search: searched ? q : undefined,
    orderby,
    order,
    min_price: parseNonNegativeInt(first(sp.min_price)),
    max_price: parseNonNegativeInt(first(sp.max_price)),
  };

  return { query: q, searched, productParams };
}
