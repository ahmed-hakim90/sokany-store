"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Container } from "@/components/Container";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ErrorState } from "@/components/ErrorState";
import { useCart } from "@/hooks/useCart";
import { useProductsCatalog } from "@/hooks/useProductsCatalog";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { ROUTES } from "@/lib/constants";
import { StorefrontStaleDataNotice } from "@/components/storefront-stale-data-notice";
import { focusProductSearchHeaderInput } from "@/lib/product-search-header";
import {
  findCategoryById,
  getCategoryHorizontalNavCategories,
  getChildCategories,
  getTopLevelCategories,
} from "@/features/catalog/lib/catalog-category-tree";
import { CatalogBreadcrumb } from "@/features/catalog/components/catalog-breadcrumb";
import { CatalogCategoryDiscovery } from "@/features/catalog/components/catalog-category-discovery";
import { CatalogChildCategories } from "@/features/catalog/components/catalog-child-categories";
import { CatalogEmptyStates } from "@/features/catalog/components/catalog-empty-states";
import { CatalogListingLayout } from "@/features/catalog/components/catalog-listing-layout";
import { CatalogPageHeader } from "@/features/catalog/components/catalog-page-header";
import {
  CatalogDiscoverySkeleton,
  CatalogSidebarSkeleton,
} from "@/features/catalog/components/catalog-page-skeletons";
import { CatalogPagination } from "@/features/catalog/components/CatalogPagination";
import { CatalogStoreBanner } from "@/features/catalog/components/catalog-store-banner";
import { CategorySidebar } from "@/features/categories/components/CategorySidebar";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { ProductGrid } from "@/features/products/components/ProductGrid";

/*
 * صفحة الكتالوج (/products):
 * — الجوال (< lg): رأس هيرو (عنوان + عدد + ترتيب) → سكة لاصقة (دوائر) → بانر → شبكة؛ الفلتر من أيقونة الهيدر + درج التصفية.
 * — ديسكتوب (lg+): رأس هيرو مع ترتيب في الصف نفسه → مسار → بانر | عمود شجرة + فلتر | شبكة 3–5 أعمدة.
 * ?category= يحدّد التصنيف النشط دون تغيير المسار.
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
  const { offline } = useNetworkStatus();
  const categoriesQuery = useCategories({ per_page: 100 });

  const allCategories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  );
  const productNavCategories = useMemo(
    () => getTopLevelCategories(allCategories.filter((c) => c.count > 0)),
    [allCategories],
  );

  const selectedCategory = useMemo(() => {
    if (!activeCategoryId || isFeatured) return null;
    return findCategoryById(allCategories, activeCategoryId);
  }, [activeCategoryId, isFeatured, allCategories]);

  const childCategories = useMemo(() => {
    if (!selectedCategory) return [];
    return getChildCategories(allCategories, selectedCategory.id);
  }, [allCategories, selectedCategory]);

  const catalogPeerCategories = useMemo(() => {
    if (!selectedCategory) return [];
    return getCategoryHorizontalNavCategories(allCategories, selectedCategory);
  }, [allCategories, selectedCategory]);

  const relatedCategories = useMemo(() => {
    if (!selectedCategory) return productNavCategories.slice(0, 6);
    const parentId = selectedCategory.parentId;
    if (parentId > 0) {
      return getChildCategories(allCategories, parentId).filter(
        (c) => c.id !== selectedCategory.id,
      );
    }
    return productNavCategories.filter((c) => c.id !== selectedCategory.id).slice(0, 6);
  }, [allCategories, productNavCategories, selectedCategory]);

  const pageTitle = selectedCategory?.name ?? "كل المنتجات";

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
  const fromApiCache = productsQuery.data?.responseSource === "cache-fallback";
  const showStaleNotice =
    (fromApiCache && pagedItems.length > 0) ||
    (offline && pagedItems.length > 0) ||
    (productsQuery.isError && pagedItems.length > 0);
  const staleVariant =
    offline && pagedItems.length > 0 ? "offline-cache" : "api-fallback";
  const catalogFatalError = productsQuery.isError && pagedItems.length === 0;
  const isLoadingGrid = productsQuery.isPending && pagedItems.length === 0;
  const emptyVariant =
    selectedCategory &&
    !catalogParams.search &&
    catalogParams.min_price == null &&
    catalogParams.max_price == null &&
    !isFeatured
      ? "category"
      : "filters";

  const catalogGrid = catalogFatalError ? (
    <ErrorState
      message={productsQuery.error.message}
      onRetry={() => void productsQuery.refetch()}
    />
  ) : (
    <>
      {showStaleNotice ? (
        <div className="mb-3">
          <StorefrontStaleDataNotice variant={staleVariant} />
        </div>
      ) : null}
      <ProductGrid
        status={
          isLoadingGrid ? "loading" : !pagedItems.length ? "empty" : "ready"
        }
        products={pagedItems}
        virtualize="auto"
        getCartLineQuantity={getCartLineQuantity}
        onCartLineQuantityChange={setProductLineQuantity}
        cardVariant="mobileCompact"
        cardVariantMd="desktopCatalogWide"
        gridClassName="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        empty={
          <CatalogEmptyStates
            variant={emptyVariant}
            relatedCategories={relatedCategories}
          />
        }
      />
      {!isLoadingGrid && !catalogFatalError && pagedItems.length > 0 ? (
        <CatalogPagination
          currentPage={currentCatalogPage}
          totalPages={totalPages}
          getHref={getPageHref}
        />
      ) : null}
    </>
  );

  const discoveryRail =
    categoriesQuery.isPending ? (
      <CatalogDiscoverySkeleton />
    ) : selectedCategory ? (
      <CategorySidebar
        variant="rail"
        linkMode="productsQuery"
        categories={
          catalogPeerCategories.length > 0 ? catalogPeerCategories : [selectedCategory]
        }
        activeCategoryId={activeCategoryId ?? null}
        allProductsActive={false}
      />
    ) : productNavCategories.length > 0 ? (
      <CatalogCategoryDiscovery
        categories={productNavCategories}
        activeCategoryId={activeCategoryId ?? null}
        allProductsActive={allActive}
        variant="visual"
      />
    ) : null;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Container className="flex min-h-0 flex-1 flex-col sm:px-2 lg:px-8 lg:pb-10 lg:pt-2">
        <CatalogListingLayout
          header={
            <CatalogPageHeader
              title={pageTitle}
              totalCount={productsQuery.data?.total ?? null}
            />
          }
          breadcrumb={
            <CatalogBreadcrumb categoryName={selectedCategory?.name ?? null} />
          }
          mobileDiscovery={discoveryRail}
          banner={
            <ScrollReveal>
              <CatalogStoreBanner selectedCategory={selectedCategory} />
            </ScrollReveal>
          }
          childCategories={
            childCategories.length > 0 ? (
              <CatalogChildCategories
                className="hidden lg:block"
                subcategories={childCategories}
                activeCategoryId={activeCategoryId ?? null}
              />
            ) : null
          }
          categories={allCategories.filter((c) => c.count > 0)}
          activeCategoryId={activeCategoryId ?? null}
          allProductsActive={allActive}
          showFilter
          sidebarLoading={categoriesQuery.isPending}
          sidebarSkeleton={<CatalogSidebarSkeleton />}
        >
          <ScrollReveal className="min-w-0 pb-4">{catalogGrid}</ScrollReveal>
        </CatalogListingLayout>
      </Container>
    </div>
  );
}
