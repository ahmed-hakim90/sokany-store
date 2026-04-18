"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { PillFilter } from "@/components/ui/pill-filter";
import { useCart } from "@/hooks/useCart";
import { useProductsCatalog } from "@/hooks/useProductsCatalog";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { focusProductSearchHeaderInput } from "@/lib/product-search-header";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { CategorySidebar } from "@/features/categories/components/CategorySidebar";
import { CatalogPromoTile } from "@/features/catalog/components/catalog-promo-tile";
import { CatalogSortSelect } from "@/features/catalog/components/catalog-sort-select";
import { PriceRangeFilter } from "@/features/catalog/components/price-range-filter";

/*
 * صفحة الكتالوج (/products): رأس ثابت (عنوان + ترتيب) ثم مساران للعرض.
 * تحت lg: شبكة 3 أعمدة — في RTL التصنيفات ~⅓ يميناً، المنتجات ~⅔ يساراً؛ خط أصغر (compact).
 * من lg: شبكة عمودين — CategorySidebar (أو كتلة سعر فقط) + عمود الشبكة بعرض متبقي.
 */
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
    catalogParams,
  } = useProductsCatalog();

  const { getCartLineQuantity, setProductLineQuantity } = useCart();

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
    <div className="rounded-editorial border border-border/70 bg-white/90 p-3 shadow-sm backdrop-blur-sm">
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
        productsQuery.isPending
          ? "loading"
          : !productsQuery.data?.length
            ? "empty"
            : "ready"
      }
      products={productsQuery.data ?? []}
      getCartLineQuantity={getCartLineQuantity}
      onCartLineQuantityChange={setProductLineQuantity}
      cardVariant="mobileCompact"
      cardVariantMd="desktopCatalogWide"
      leadingSlot={<CatalogPromoTile />}
      gridClassName="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4"
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
  const categoriesLoading = categoriesQuery.isPending;
  const showMobileCategoryNav = categoriesLoading || hasCategories;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Container className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-10">
        {/* رأس الصفحة: العنوان يسار/فوق؛ الترتيب يظهر في الشريط العلوي من md ويُنزل للجوال تحت العنوان */}
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

        {/*
         * الجوال: شبكة 3 أعمدة — في RTL العمود الأول يميناً: الشريط ⅓، المنتجات ⅔ (span 2).
         */}
        <div
          className={cn(
            "mt-4 grid min-h-0 max-h-mobile-catalog-split flex-1 items-start gap-2 lg:hidden",
            showMobileCategoryNav ? "grid-cols-3" : "grid-cols-1",
          )}
        >
          {showMobileCategoryNav ? (
            categoriesLoading ? (
              <aside className="col-span-1 min-h-0 min-w-0 self-start overflow-y-auto overscroll-y-contain py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="rounded-editorial border border-border/70 bg-white/90 p-2 shadow-sm backdrop-blur-sm">
                  <div className="h-3 w-16 animate-shimmer rounded bg-border/70" />
                  <div className="mt-2 space-y-1.5">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <div key={idx} className="h-7 animate-shimmer rounded-lg bg-surface-muted" />
                    ))}
                  </div>
                </div>
              </aside>
            ) : (
              <aside className="col-span-1 min-h-0 min-w-0 self-start overflow-y-auto overscroll-y-contain py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <CategorySidebar
                  categories={categoriesData ?? []}
                  linkMode="productsQuery"
                  activeCategoryId={activeCategoryId}
                  allProductsActive={allActive}
                  compact
                />
              </aside>
            )
          ) : null}
          <div
            className={cn(
              "flex min-h-0 min-w-0 flex-col gap-4 overflow-y-auto overscroll-y-contain pb-2",
              showMobileCategoryNav ? "col-span-2" : "col-span-1",
            )}
          >
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
        </div>

        {/* مسار سطح المكتب (lg+): عمود جانبي للتصفية/التصنيفات ثم شبكة المنتجات بعرض الشاشة المتبقي */}
        <div className="mt-8 hidden min-w-0 lg:grid lg:grid-cols-[minmax(200px,240px)_minmax(0,1fr)] lg:items-start lg:gap-8">
          <aside className="mb-8">
            {categoriesLoading ? (
              <div className="rounded-editorial border border-border/70 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
                <div className="h-5 w-28 animate-shimmer rounded bg-border/70" />
                <div className="mt-4 space-y-2">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="h-9 animate-shimmer rounded-xl bg-surface-muted" />
                  ))}
                </div>
                <div className="mt-4 border-t border-border/50 pt-4">
                  <div className="h-4 w-20 animate-shimmer rounded bg-border/70" />
                  <div className="mt-3 h-10 animate-shimmer rounded-xl bg-surface-muted" />
                </div>
              </div>
            ) : hasCategories ? (
              <CategorySidebar
                categories={categoriesData ?? []}
                linkMode="productsQuery"
                activeCategoryId={activeCategoryId}
                allProductsActive={allActive}
                footerSlot={sidebarFooter}
              />
            ) : (
              <div className="rounded-editorial border border-border/70 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
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
