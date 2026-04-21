import { ROUTES } from "@/lib/constants";

export type CatalogFilterApplyInput = {
  featured: boolean;
  categoryId: number | null;
  min_price: number | null;
  max_price: number | null;
  orderby: string;
  order: "asc" | "desc";
};

function applyCatalogFilterDraftToParams(
  params: URLSearchParams,
  draft: CatalogFilterApplyInput,
) {
  if (draft.featured) {
    params.set("featured", "true");
    params.delete("category");
  } else if (draft.categoryId != null && draft.categoryId > 0) {
    params.set("category", String(draft.categoryId));
    params.delete("featured");
  } else {
    params.delete("featured");
    params.delete("category");
  }

  if (draft.min_price != null && draft.min_price > 0) {
    params.set("min_price", String(draft.min_price));
  } else {
    params.delete("min_price");
  }
  if (draft.max_price != null && draft.max_price > 0) {
    params.set("max_price", String(draft.max_price));
  } else {
    params.delete("max_price");
  }

  if (
    draft.orderby &&
    ["date", "popularity", "price", "rating", "title"].includes(draft.orderby)
  ) {
    params.set("orderby", draft.orderby);
  } else {
    params.set("orderby", "popularity");
  }
  params.set("order", draft.order === "asc" ? "asc" : "desc");

  params.delete("page");
}

/**
 * Builds `/products?...` from current query (preserves e.g. `search`, `per_page`)
 * while replacing catalog filter fields.
 */
export function buildProductsCatalogHref(
  currentSearchParams: URLSearchParams,
  draft: CatalogFilterApplyInput,
): string {
  const params = new URLSearchParams(currentSearchParams.toString());
  applyCatalogFilterDraftToParams(params, draft);
  const qs = params.toString();
  return qs ? `${ROUTES.PRODUCTS}?${qs}` : ROUTES.PRODUCTS;
}

/**
 * Builds `/search?...` — يحافظ على `q` ومعاملات أخرى من الرابط الحالي.
 */
export function buildSearchPageCatalogHref(
  currentSearchParams: URLSearchParams,
  draft: CatalogFilterApplyInput,
): string {
  const params = new URLSearchParams(currentSearchParams.toString());
  applyCatalogFilterDraftToParams(params, draft);
  const qs = params.toString();
  return qs ? `${ROUTES.SEARCH}?${qs}` : ROUTES.SEARCH;
}
