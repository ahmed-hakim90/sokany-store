export const CATALOG_SORT_OPTIONS = [
  { value: "popularity:desc", label: "الأكثر مبيعاً" },
  { value: "date:desc", label: "الأحدث" },
  { value: "price:asc", label: "السعر: من الأقل للأعلى" },
  { value: "price:desc", label: "السعر: من الأعلى للأقل" },
  { value: "rating:desc", label: "الأعلى تقييماً" },
  { value: "rand", label: "ترتيب عشوائي" },
] as const;

export function getCatalogSortLabel(searchParams: URLSearchParams): string {
  const orderby = searchParams.get("orderby") ?? "popularity";
  if (orderby === "rand") {
    return CATALOG_SORT_OPTIONS.find((o) => o.value === "rand")?.label ?? "ترتيب عشوائي";
  }
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";
  const value = `${orderby}:${order}`;
  return (
    CATALOG_SORT_OPTIONS.find((o) => o.value === value)?.label ??
    CATALOG_SORT_OPTIONS[0].label
  );
}

export function catalogHasActiveFilters(searchParams: URLSearchParams): boolean {
  if (searchParams.get("featured") === "true") return true;
  if (searchParams.get("category")) return true;
  if (searchParams.get("min_price")) return true;
  if (searchParams.get("max_price")) return true;
  const orderby = searchParams.get("orderby");
  if (orderby && orderby !== "popularity") return true;
  if (searchParams.get("order") === "asc") return true;
  return false;
}
