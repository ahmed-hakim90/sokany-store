"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import { startTransition } from "react";
import { Button } from "@/components/Button";
import { ErrorState } from "@/components/ErrorState";
import { useCategories } from "@/features/categories/hooks/useCategories";
import {
  CATALOG_PRICE_DEFAULT_MAX,
  PriceRangeFilter,
} from "@/features/catalog/components/price-range-filter";
import { useCatalogFilterDrawerOpenStore } from "@/features/catalog/store/useCatalogFilterDrawerOpenStore";
import { buildProductsCatalogHref } from "@/lib/catalog-products-url";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "popularity:desc", label: "الأكثر مبيعاً" },
  { value: "date:desc", label: "الأحدث" },
  { value: "price:asc", label: "السعر: من الأقل للأعلى" },
  { value: "price:desc", label: "السعر: من الأعلى للأقل" },
  { value: "rating:desc", label: "الأعلى تقييماً" },
] as const;

function parseSortFromSearchParams(sp: URLSearchParams): string {
  const orderby = sp.get("orderby") ?? "popularity";
  const order = sp.get("order") === "asc" ? "asc" : "desc";
  const v = `${orderby}:${order}`;
  return SORT_OPTIONS.some((o) => o.value === v) ? v : "popularity:desc";
}

function chipClass(active: boolean) {
  return cn(
    "rounded-xl border px-3 py-2 text-start text-sm transition-colors",
    active
      ? "border-brand-950 bg-brand-950 font-bold text-accent shadow-sm"
      : "border-border/80 bg-white/95 font-medium text-muted-foreground hover:bg-black/[0.03]",
  );
}

export type CatalogFilterFormProps = {
  /** Bump when the drawer opens to re-sync draft from the URL. */
  resetKey: number;
};

export function CatalogFilterForm({ resetKey }: CatalogFilterFormProps) {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const closeDrawer = useCatalogFilterDrawerOpenStore((s) => s.closeDrawer);
  const categoriesQuery = useCategories();

  const [featured, setFeatured] = useState(false);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [sortValue, setSortValue] = useState("popularity:desc");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(CATALOG_PRICE_DEFAULT_MAX);

  useEffect(() => {
    const sp = new URLSearchParams(searchParams.toString());
    const isFeatured = sp.get("featured") === "true";
    const catRaw = sp.get("category");
    const parsedCat = catRaw ? Number.parseInt(catRaw, 10) : NaN;
    const validCat =
      Number.isFinite(parsedCat) && parsedCat > 0 ? parsedCat : null;

    setFeatured(isFeatured);
    setCategoryId(isFeatured ? null : validCat);

    const minP = sp.get("min_price");
    const maxP = sp.get("max_price");
    setPriceMin(minP ? Number.parseInt(minP, 10) || 0 : 0);
    setPriceMax(maxP ? Number.parseInt(maxP, 10) || CATALOG_PRICE_DEFAULT_MAX : CATALOG_PRICE_DEFAULT_MAX);

    setSortValue(parseSortFromSearchParams(sp));
  }, [resetKey, searchParams]);

  const apply = () => {
    const [orderby, order] = sortValue.split(":") as [string, "asc" | "desc"];
    const min_price =
      priceMin > 0 ? priceMin : null;
    const max_price =
      priceMax > 0 && priceMax < CATALOG_PRICE_DEFAULT_MAX ? priceMax : null;

    const href = buildProductsCatalogHref(searchParams, {
      featured,
      categoryId: featured ? null : categoryId,
      min_price,
      max_price,
      orderby,
      order: order === "asc" ? "asc" : "desc",
    });

    startTransition(() => {
      router.push(href, { scroll: false });
      closeDrawer();
    });
  };

  const categories = categoriesQuery.data ?? [];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <section className="space-y-2">
        <h3 className="text-xs font-bold text-muted-foreground">التصنيف</h3>
        {categoriesQuery.isPending ? (
          <div className="space-y-2" aria-busy="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 animate-shimmer rounded-xl bg-surface-muted" />
            ))}
          </div>
        ) : categoriesQuery.isError ? (
          <ErrorState
            message={categoriesQuery.error.message}
            onRetry={() => void categoriesQuery.refetch()}
          />
        ) : (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className={chipClass(!featured && categoryId == null)}
              onClick={() => {
                setFeatured(false);
                setCategoryId(null);
              }}
            >
              الكل
            </button>
            <button
              type="button"
              className={chipClass(featured)}
              onClick={() => {
                setFeatured(true);
                setCategoryId(null);
              }}
            >
              مميز
            </button>
            {categories.map((c) => {
              const active = !featured && categoryId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  className={chipClass(active)}
                  onClick={() => {
                    setFeatured(false);
                    setCategoryId(c.id);
                  }}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="text-xs font-bold text-muted-foreground">ترتيب حسب</h3>
        <label className="sr-only" htmlFor="catalog-drawer-sort">
          ترتيب المنتجات
        </label>
        <select
          id="catalog-drawer-sort"
          className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-brand-500/35"
          value={sortValue}
          onChange={(e) => setSortValue(e.target.value)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </section>

      <section className="space-y-2">
        <h3 className="text-xs font-bold text-muted-foreground">نطاق السعر</h3>
        <PriceRangeFilter
          key={`price-${resetKey}`}
          minPrice={priceMin}
          maxPrice={priceMax}
          showActionButtons={false}
          onValuesChange={(min, max) => {
            setPriceMin(min);
            setPriceMax(max);
          }}
          onApply={() => {}}
        />
      </section>

      <div className="mt-auto border-t border-border/70 pt-4 sticky bottom-0 bg-page">
        <Button
          type="button"
          variant="primary"
          className="w-full font-bold"
          onClick={apply}
        >
          عرض النتائج
        </Button>
      </div>
    </div>
  );
}
