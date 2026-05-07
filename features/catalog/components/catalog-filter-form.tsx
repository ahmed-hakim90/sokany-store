"use client";

import { useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
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
import {
  type CatalogFilterApplyInput,
  buildProductsCatalogHref,
  buildSearchPageCatalogHref,
} from "@/lib/catalog-products-url";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "popularity:desc", label: "الأكثر مبيعاً" },
  { value: "date:desc", label: "الأحدث" },
  { value: "price:asc", label: "السعر: من الأقل للأعلى" },
  { value: "price:desc", label: "السعر: من الأعلى للأقل" },
  { value: "rating:desc", label: "الأعلى تقييماً" },
  { value: "rand", label: "ترتيب عشوائي" },
] as const;

function parseSortFromSearchParams(sp: URLSearchParams): string {
  const orderby = sp.get("orderby") ?? "popularity";
  if (orderby === "rand") return "rand";
  const order = sp.get("order") === "asc" ? "asc" : "desc";
  const v = `${orderby}:${order}`;
  return SORT_OPTIONS.some((o) => o.value === v) ? v : "popularity:desc";
}

function chipClass(active: boolean) {
  return cn(
    "rounded-lg border px-2.5 py-1.5 text-start text-sm transition-colors",
    active
      ? "border-brand-950 bg-brand-950 font-bold text-accent shadow-sm"
      : "border-border/80 bg-white/95 font-medium text-muted-foreground hover:bg-black/[0.03]",
  );
}

function parseCatalogFilterDraft(searchParams: ReturnType<typeof useSearchParams>) {
  const sp = new URLSearchParams(searchParams.toString());
  const isFeatured = sp.get("featured") === "true";
  const catRaw = sp.get("category");
  const parsedCat = catRaw ? Number.parseInt(catRaw, 10) : NaN;
  const validCat =
    Number.isFinite(parsedCat) && parsedCat > 0 ? parsedCat : null;
  const minP = sp.get("min_price");
  const maxP = sp.get("max_price");

  return {
    featured: isFeatured,
    categoryId: isFeatured ? null : validCat,
    priceMin: minP ? Number.parseInt(minP, 10) || 0 : 0,
    priceMax: maxP
      ? Number.parseInt(maxP, 10) || CATALOG_PRICE_DEFAULT_MAX
      : CATALOG_PRICE_DEFAULT_MAX,
    sortValue: parseSortFromSearchParams(sp),
  };
}

export function CatalogFilterForm() {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const closeDrawer = useCatalogFilterDrawerOpenStore((s) => s.closeDrawer);
  const categoriesQuery = useCategories({ per_page: 100 });
  const initialDraft = parseCatalogFilterDraft(searchParams);

  const [featured, setFeatured] = useState(initialDraft.featured);
  const [categoryId, setCategoryId] = useState<number | null>(initialDraft.categoryId);
  const [sortValue, setSortValue] = useState(initialDraft.sortValue);
  const [priceMin, setPriceMin] = useState(initialDraft.priceMin);
  const [priceMax, setPriceMax] = useState(initialDraft.priceMax);

  const apply = () => {
    const min_price =
      priceMin > 0 ? priceMin : null;
    const max_price =
      priceMax > 0 && priceMax < CATALOG_PRICE_DEFAULT_MAX ? priceMax : null;

    let draft: CatalogFilterApplyInput;
    if (sortValue === "rand") {
      draft = {
        featured,
        categoryId: featured ? null : categoryId,
        min_price,
        max_price,
        orderby: "rand",
      };
    } else {
      const [orderby, order] = sortValue.split(":") as [string, "asc" | "desc"];
      draft = {
        featured,
        categoryId: featured ? null : categoryId,
        min_price,
        max_price,
        orderby,
        order: order === "asc" ? "asc" : "desc",
      };
    }

    const href =
      pathname === ROUTES.SEARCH
        ? buildSearchPageCatalogHref(searchParams, draft)
        : buildProductsCatalogHref(searchParams, draft);

    startTransition(() => {
      router.push(href, { scroll: false });
      closeDrawer();
    });
  };

  const categories = useMemo(
    () => (categoriesQuery.data ?? []).filter((c) => c.count > 0),
    [categoriesQuery.data],
  );

  /*
   * درج التصفية (موبايل/ضيق): ترتيب + سعر في الأعلى (أكثر استخداماً)، ثم تصنيفات
   * داخل صندوق بارتفاع محدود وسكرول لتقصير المسار البصري. زر التطبيق لاصق أسفل منطقة السكرول.
   */
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <section className="space-y-2 rounded-xl border border-border/70 bg-white/80 p-3 shadow-sm">
        <h3 className="text-xs font-bold text-muted-foreground">ترتيب وعرض</h3>
        <label className="sr-only" htmlFor="catalog-drawer-sort">
          ترتيب المنتجات
        </label>
        <select
          id="catalog-drawer-sort"
          className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-brand-500/35"
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

      <section className="space-y-2 rounded-xl border border-border/70 bg-white/80 p-3 shadow-sm">
        <h3 className="text-xs font-bold text-muted-foreground">نطاق السعر</h3>
        <PriceRangeFilter
          key="price"
          minPrice={priceMin}
          maxPrice={priceMax}
          showActionButtons={false}
          hideBuiltInHeading
          onValuesChange={(min, max) => {
            setPriceMin(min);
            setPriceMax(max);
          }}
          onApply={() => {}}
        />
      </section>

      <section className="min-h-0 space-y-2">
        <h3 className="text-xs font-bold text-muted-foreground">التصنيف</h3>
        {categoriesQuery.isPending ? (
          <div className="space-y-2" aria-busy="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 animate-shimmer rounded-lg bg-surface-muted" />
            ))}
          </div>
        ) : categoriesQuery.isError ? (
          <ErrorState
            message={categoriesQuery.error.message}
            onRetry={() => void categoriesQuery.refetch()}
          />
        ) : (
          <div className="rounded-xl border border-border/60 bg-surface-muted/25 p-2">
            <div
              className="max-h-[min(42dvh,15rem)] space-y-1.5 overflow-y-auto overscroll-y-contain pe-0.5"
              role="group"
              aria-label="قائمة التصنيفات"
            >
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
                    <span className="line-clamp-2">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <div className="mt-auto border-t border-border/70 bg-page pt-3 pb-1 supports-[backdrop-filter]:backdrop-blur-[2px]">
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
