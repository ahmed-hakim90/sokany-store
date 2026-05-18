"use client";

import { useSearchParams } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import { startTransition } from "react";
import { ArrowUpDown, SlidersHorizontal, X } from "lucide-react";
import { CatalogFilterDrawerTrigger } from "@/features/catalog/components/CatalogFilterDrawerTrigger";
import { CatalogSortSelect } from "@/features/catalog/components/catalog-sort-select";
import {
  catalogHasActiveFilters,
  getCatalogSortLabel,
} from "@/features/catalog/lib/catalog-sort-label";
import { findCategoryById } from "@/features/catalog/lib/catalog-category-tree";
import { useCatalogFilterDrawerOpenStore } from "@/features/catalog/store/useCatalogFilterDrawerOpenStore";
import type { Category } from "@/features/categories/types";
import { ROUTES } from "@/lib/constants";
import { surfacePanelClass } from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";

export type CatalogToolbarProps = {
  totalCount?: number | null;
  pageCount?: number;
  showFilter?: boolean;
  /** عند true تُخفى عناصر الترتيب (مثلاً إن وُجدت في رأس صفحة الكتالوج) */
  hideSort?: boolean;
  categories?: Category[];
  activeCategoryId?: number | null;
  className?: string;
};

/*
 * شريط الكتالوج (يُستخدم خارج تخطيط قائمة /products عند الحاجة، مثلاً البحث والعروض):
 * — الجوال: عدد + فلتر + شريحة التصنيف؛ بدون صف ترتيب عند hideSort.
 * — من lg: عدد + ترتيب منسدل (أو مخفي مع hideSort)؛ الفلتر الكامل في الشريط الجانبي لمسار المنتجات.
 */
export function CatalogToolbar({
  totalCount,
  pageCount,
  showFilter = true,
  hideSort = false,
  categories = [],
  activeCategoryId,
  className,
}: CatalogToolbarProps) {
  const searchParams = useSearchParams();
  const router = useTransitionRouter();
  const sortLabel = hideSort ? "" : getCatalogSortLabel(searchParams);
  const hasFilters = catalogHasActiveFilters(searchParams);
  const activeCategory = findCategoryById(categories, activeCategoryId);

  const countLabel =
    typeof totalCount === "number" && totalCount > 0
      ? `${totalCount} منتج`
      : typeof pageCount === "number" && pageCount > 0
        ? `${pageCount} في هذه الصفحة`
        : null;

  const clearCategory = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("page");
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${ROUTES.PRODUCTS}?${qs}` : ROUTES.PRODUCTS, {
        scroll: false,
      });
    });
  };

  return (
    <div
      className={cn(
        surfacePanelClass,
        "flex min-w-0 flex-col gap-2 px-3 py-2.5 backdrop-blur-sm",
        "max-lg:sticky max-lg:top-[calc(var(--header-height,3.5rem)+0.25rem)] max-lg:z-20",
        className,
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          {countLabel ? (
            <p className="text-sm font-bold text-brand-950">{countLabel}</p>
          ) : (
            <p className="text-sm font-bold text-brand-950">المنتجات</p>
          )}
          {!hideSort ? (
            <p className="text-[11px] text-muted-foreground lg:hidden">
              ترتيب: {sortLabel}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {!hideSort ? (
            <div className="hidden lg:block">
              <CatalogSortSelect />
            </div>
          ) : null}
          {!hideSort ? (
            <button
              type="button"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border/80 bg-white px-3 text-xs font-semibold text-brand-950 transition-colors hover:bg-surface-muted/60 lg:hidden"
              onClick={() => useCatalogFilterDrawerOpenStore.getState().openDrawer()}
              aria-label="تغيير الترتيب"
            >
              <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />
              ترتيب
            </button>
          ) : null}
          {showFilter ? (
            <>
              {!hideSort ? (
                <button
                  type="button"
                  className="hidden min-h-9 items-center gap-1.5 rounded-lg border border-border/80 bg-white px-3 text-xs font-semibold text-brand-950 transition-colors hover:bg-surface-muted/60 lg:inline-flex"
                  onClick={() => useCatalogFilterDrawerOpenStore.getState().openDrawer()}
                  aria-label="تغيير الترتيب والتصفية"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
                  {sortLabel}
                </button>
              ) : null}
              <span className="lg:hidden">
                <CatalogFilterDrawerTrigger hasFilters={hasFilters} />
              </span>
            </>
          ) : null}
        </div>
      </div>

      {activeCategory ? (
        <div className="flex min-w-0 items-center gap-2 lg:hidden">
          <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-950">
            <span className="truncate">{activeCategory.name}</span>
            <button
              type="button"
              onClick={clearCategory}
              className="shrink-0 rounded-full p-0.5 hover:bg-brand-100"
              aria-label="إزالة تصفية التصنيف"
            >
              <X className="h-3 w-3" aria-hidden />
            </button>
          </span>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => {
                startTransition(() => {
                  router.push(ROUTES.PRODUCTS, { scroll: false });
                });
              }}
              className="shrink-0 text-[11px] font-bold text-brand-800 underline-offset-2 hover:underline"
            >
              مسح الفلاتر
            </button>
          ) : null}
        </div>
      ) : hasFilters ? (
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => {
              startTransition(() => {
                router.push(ROUTES.PRODUCTS, { scroll: false });
              });
            }}
            className="text-[11px] font-bold text-brand-800 underline-offset-2 hover:underline"
          >
            مسح الفلاتر
          </button>
        </div>
      ) : null}
    </div>
  );
}
