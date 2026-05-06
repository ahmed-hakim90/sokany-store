"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Link } from "next-view-transitions";
import { Container } from "@/components/Container";
import { ScrollReveal } from "@/components/ScrollReveal";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { useCart } from "@/hooks/useCart";
import { useProductsCatalog } from "@/hooks/useProductsCatalog";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { focusProductSearchHeaderInput } from "@/lib/product-search-header";
import { CatalogPagination } from "@/features/catalog/components/CatalogPagination";
import { CategoryScrollerSkeleton } from "@/features/categories/components/CategoryScrollerSkeleton";
import { CategorySidebar } from "@/features/categories/components/CategorySidebar";
import { StickyBelowHeaderRail } from "@/features/categories/components/sticky-below-header-rail";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { HomeCategoryExclusiveBanner } from "@/features/home/components/home-category-exclusive-banner";
import { ProductGrid } from "@/features/products/components/ProductGrid";

/*
 * صفحة الكتالوج (/products):
 * ‎`sm`‎/`lg`: شريط تصنيفات أفقي (دوائر) أولاً → عند ‎`?category=id`‎ بانر صورة التصنيف تحته → شبكة المنتجات.
 * بدون عنوان صفحة؛ التصفية من أيقونة الفلتر بجانب البحث في الهيدر.
 */
export function ProductsPageContent() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#catalog-search") return;
    const frame = window.requestAnimationFrame(() => {
      focusProductSearchHeaderInput();
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const {
    productsQuery,
    searchParams,
    catalogParams,
    activeCategoryId,
    allActive,
    isFeatured,
  } = useProductsCatalog();
  const categoriesQuery = useCategories({ per_page: 100 });
  const productNavCategories = useMemo(() => {
    const data = categoriesQuery.data;
    if (!data?.length) return [];
    return data.filter((c) => c.count > 0);
  }, [categoriesQuery.data]);

  /** لبانر الصورة: أي تصنيف مُصفّى بالـ id من قائمة وو (حتى لو count=0 في لحظة معيّنة). */
  const selectedCategoryForBanner = useMemo(() => {
    if (!activeCategoryId || isFeatured) return null;
    const full = categoriesQuery.data ?? [];
    return full.find((c) => c.id === activeCategoryId) ?? null;
  }, [activeCategoryId, isFeatured, categoriesQuery.data]);

  const showCategoryRail =
    categoriesQuery.isPending ||
    (categoriesQuery.isSuccess && productNavCategories.length > 0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [searchParams]);

  const { getCartLineQuantity, setProductLineQuantity } = useCart();

  const getPageHref = useCallback(
    (page: number) => {
      const sp = new URLSearchParams(searchParams.toString());
      if (page <= 1) sp.delete("page");
      else sp.set("page", String(page));
      const q = sp.toString();
      return q ? `${ROUTES.PRODUCTS}?${q}` : ROUTES.PRODUCTS;
    },
    [searchParams],
  );

  const pagedItems = productsQuery.data?.items ?? [];
  const totalPages = productsQuery.data?.totalPages ?? 1;
  const currentCatalogPage = catalogParams.page ?? 1;

  const catalogGrid = productsQuery.isError ? (
    <ErrorState
      message={productsQuery.error.message}
      onRetry={() => void productsQuery.refetch()}
    />
  ) : (
    <>
      <ProductGrid
        status={
          productsQuery.isPending
            ? "loading"
            : !pagedItems.length
              ? "empty"
              : "ready"
        }
        products={pagedItems}
        getCartLineQuantity={getCartLineQuantity}
        onCartLineQuantityChange={setProductLineQuantity}
        cardVariant="mobileCompact"
        cardVariantMd="desktopCatalogWide"
        gridClassName="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5"
        empty={
          <EmptyState
            title="لا توجد منتجات"
            description="جرّب بحثاً آخر أو اضبط التصفية من أيقونة الفلتر بجانب البحث."
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
      {!productsQuery.isPending && !productsQuery.isError && pagedItems.length > 0 ? (
        <CatalogPagination
          currentPage={currentCatalogPage}
          totalPages={totalPages}
          getHref={getPageHref}
        />
      ) : null}
    </>
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Container className="flex min-h-0 flex-1 flex-col sm:px-2 lg:px-8 lg:pb-10 lg:pt-2">
        <h1 className="sr-only">كل منتجات سوكاني المصرية</h1>
        {categoriesQuery.isPending ? (
          <div className="min-w-0">
            <StickyBelowHeaderRail>
              <CategoryScrollerSkeleton />
            </StickyBelowHeaderRail>
          </div>
        ) : categoriesQuery.isSuccess && productNavCategories.length > 0 ? (
          <div className="min-w-0">
            <StickyBelowHeaderRail>
              <CategorySidebar
                categories={productNavCategories}
                variant="rail"
                linkMode="productsQuery"
                activeCategoryId={activeCategoryId ?? null}
                allProductsActive={allActive}
              />
            </StickyBelowHeaderRail>
          </div>
        ) : null}

        {selectedCategoryForBanner ? (
          <div className="mt-3 min-w-0 sm:mt-4">
            <ScrollReveal>
              <HomeCategoryExclusiveBanner category={selectedCategoryForBanner} />
            </ScrollReveal>
          </div>
        ) : null}

        <ScrollReveal
          className={cn(
            "min-w-0 pb-4",
            showCategoryRail || selectedCategoryForBanner
              ? "mt-3 sm:mt-4"
              : "mt-6",
          )}
        >
          {catalogGrid}
        </ScrollReveal>
      </Container>
    </div>
  );
}
