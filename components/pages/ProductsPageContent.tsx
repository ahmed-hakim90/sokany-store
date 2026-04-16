"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { PillFilter } from "@/components/ui/pill-filter";
import { useProductsCatalog } from "@/hooks/useProductsCatalog";
import { ROUTES } from "@/lib/constants";
import { focusProductSearchHeaderInput } from "@/lib/product-search-header";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { CategorySidebar } from "@/features/categories/components/CategorySidebar";
import { CategoryCatalogRail } from "@/features/categories/components/category-catalog-rail";
import { CatalogPromoTile } from "@/features/catalog/components/catalog-promo-tile";
import { CatalogSortSelect } from "@/features/catalog/components/catalog-sort-select";
import { PriceRangeFilter } from "@/features/catalog/components/price-range-filter";

export function ProductsPageContent() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#catalog-search") return;
    const frame = window.requestAnimationFrame(() => {
      focusProductSearchHeaderInput();
    });
    const { pathname, search } = window.location;
    window.history.replaceState(null, "", `${pathname}${search}`);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const {
    productsQuery,
    categoriesQuery,
    isFeatured,
    activeCategoryId,
    allActive,
    pushFilters,
    addProductToCart,
    catalogParams,
  } = useProductsCatalog();

  const priceFilterKey = `${catalogParams.min_price ?? 0}-${catalogParams.max_price ?? "x"}`;

  const sidebarFooter = (
    <PriceRangeFilter
      key={priceFilterKey}
      minPrice={catalogParams.min_price}
      maxPrice={catalogParams.max_price}
      onApply={({ min, max }) => {
        pushFilters({
          min_price: min,
          max_price: max,
        });
      }}
    />
  );

  const mobilePriceFilter = (
    <div className="rounded-[var(--radius-editorial,1.5rem)] border border-border/70 bg-white/90 p-3 shadow-sm backdrop-blur-sm">
      <p className="mb-2 text-xs font-bold text-foreground">نطاق السعر</p>
      <PriceRangeFilter
        key={priceFilterKey}
        minPrice={catalogParams.min_price}
        maxPrice={catalogParams.max_price}
        onApply={({ min, max }) => {
          pushFilters({
            min_price: min,
            max_price: max,
          });
        }}
      />
    </div>
  );

  const catalogGrid = productsQuery.isError ? (
    <ErrorState
      message={productsQuery.error.message}
      onRetry={() => void productsQuery.refetch()}
    />
  ) : (
    <ProductGrid
      status={
        productsQuery.isLoading
          ? "loading"
          : !productsQuery.data?.length
            ? "empty"
            : "ready"
      }
      products={productsQuery.data ?? []}
      onAddToCart={addProductToCart}
      cardVariant="mobileCompact"
      cardVariantMd="desktopCatalogWide"
      leadingSlot={<CatalogPromoTile />}
      gridClassName="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3"
      empty={
        <EmptyState
          title="لا توجد منتجات"
          description="جرّب بحثاً آخر أو أزل التصفية."
          action={
            <Link
              href={ROUTES.PRODUCTS}
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-white px-4 text-sm font-medium text-foreground hover:bg-surface-muted"
            >
              إعادة التعيين
            </Link>
          }
        />
      }
    />
  );

  const categoriesData = categoriesQuery.data;
  const hasCategories = (categoriesData?.length ?? 0) > 0;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Container className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-10">
        <div className="shrink-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-brand-950 sm:text-2xl md:text-3xl">
                المنتجات
              </h1>
              <p className="text-sm text-muted-foreground">
                تصفح كامل الكتالوج مع البحث والتصفية.
              </p>
            </div>
            <div className="hidden md:block">
              <CatalogSortSelect />
            </div>
          </div>

          <div className="mt-4 md:hidden">
            <CatalogSortSelect />
          </div>
        </div>

        <div
          className="mt-4 flex min-h-0 max-h-[calc(100dvh-7rem-var(--mobile-commerce-chrome-height))] flex-1 flex-row gap-2 lg:hidden"
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-y-contain pb-2">
            <div className="flex flex-wrap gap-2">
              <PillFilter
                active={isFeatured}
                onClick={() => pushFilters({ featured: true })}
              >
                مميز
              </PillFilter>
            </div>
            {mobilePriceFilter}
            {catalogGrid}
          </div>
          {hasCategories ? (
            <CategoryCatalogRail
              categories={categoriesData ?? []}
              linkMode="productsQuery"
              allProductsActive={allActive}
              activeCategoryId={activeCategoryId}
            />
          ) : null}
        </div>

        <div className="mt-8 hidden min-w-0 lg:grid lg:grid-cols-[minmax(200px,240px)_minmax(0,1fr)] lg:items-start lg:gap-8">
          <aside className="mb-8">
            {hasCategories ? (
              <CategorySidebar
                categories={categoriesData ?? []}
                linkMode="productsQuery"
                activeCategoryId={activeCategoryId}
                allProductsActive={allActive}
                footerSlot={sidebarFooter}
              />
            ) : (
              <div className="rounded-[var(--radius-editorial,1.5rem)] border border-border/70 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
                <p className="mb-3 text-sm font-bold text-foreground">نطاق السعر</p>
                <PriceRangeFilter
                  key={priceFilterKey}
                  minPrice={catalogParams.min_price}
                  maxPrice={catalogParams.max_price}
                  onApply={({ min, max }) => {
                    pushFilters({
                      min_price: min,
                      max_price: max,
                    });
                  }}
                />
              </div>
            )}
          </aside>

          <div className="min-w-0">{catalogGrid}</div>
        </div>
      </Container>
    </div>
  );
}
