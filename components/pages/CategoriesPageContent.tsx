"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { useCart } from "@/hooks/useCart";
import { DEFAULT_PAGE, ROUTES } from "@/lib/constants";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { CategoryScroller } from "@/features/categories/components/CategoryScroller";
import { CategoryScrollerSkeleton } from "@/features/categories/components/CategoryScrollerSkeleton";
import { CategorySidebar } from "@/features/categories/components/CategorySidebar";
import { CategoryCatalogRail } from "@/features/categories/components/category-catalog-rail";
import { CatalogPromoTile } from "@/features/catalog/components/catalog-promo-tile";
import { useProducts } from "@/features/products/hooks/useProducts";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import type { Category } from "@/features/categories/types";
import type { Product } from "@/features/products/types";

function CategoriesIntro() {
  return (
    <div>
      <h1 className="font-display text-xl font-bold tracking-tight text-brand-950 sm:text-2xl md:text-3xl">
        التصنيفات
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        تصفّح الأقسام من الجانب واطّلع على منتجات متاحة بسرعة.
      </p>
    </div>
  );
}

function AvailableProductsSection({
  productsQuery,
  getCartLineQuantity,
  onCartLineQuantityChange,
  router,
}: {
  productsQuery: ReturnType<typeof useProducts>;
  getCartLineQuantity: (productId: number) => number;
  onCartLineQuantityChange: (product: Product, next: number) => void;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <section
      className="space-y-3 rounded-2xl border border-border/80 p-4 sm:p-5"
      aria-labelledby="categories-available-products-title"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h2
          id="categories-available-products-title"
          className="text-base font-bold tracking-tight text-black sm:text-lg md:text-xl"
        >
          منتجات متاحة
        </h2>
        <Link
          href={ROUTES.PRODUCTS}
          className="text-xs font-semibold text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline sm:text-sm"
        >
          مشاهدة الكل
        </Link>
      </div>

      {productsQuery.isError ? (
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
          getCartLineQuantity={getCartLineQuantity}
          onCartLineQuantityChange={onCartLineQuantityChange}
          cardVariant="mobileCompact"
          cardVariantMd="desktopCatalogWide"
          leadingSlot={<CatalogPromoTile />}
          gridClassName="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3"
          empty={
            <EmptyState
              title="لا توجد منتجات حالياً"
              description="تصفح الكتالوج الكامل من صفحة المنتجات."
              action={
                <Button type="button" onClick={() => router.push(ROUTES.PRODUCTS)}>
                  المنتجات
                </Button>
              }
            />
          }
        />
      )}
    </section>
  );
}

function CategoriesSplitLayout({
  categories,
  productsQuery,
  getCartLineQuantity,
  onCartLineQuantityChange,
  router,
}: {
  categories: Category[];
  productsQuery: ReturnType<typeof useProducts>;
  getCartLineQuantity: (productId: number) => number;
  onCartLineQuantityChange: (product: Product, next: number) => void;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <>
      <div className="flex min-h-0 max-h-[calc(100dvh-7rem-var(--mobile-commerce-chrome-height))] flex-1 flex-row gap-2 lg:hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-y-contain pb-2">
          <CategoriesIntro />
          <AvailableProductsSection
            productsQuery={productsQuery}
            getCartLineQuantity={getCartLineQuantity}
            onCartLineQuantityChange={onCartLineQuantityChange}
            router={router}
          />
        </div>
        <CategoryCatalogRail categories={categories} linkMode="slug" activeSlug="" />
      </div>

      <div className="hidden min-w-0 lg:grid lg:grid-cols-[minmax(200px,220px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <aside className="mb-8">
          <CategorySidebar categories={categories} />
        </aside>
        <div className="min-w-0">
          <div className="mb-8">
            <CategoryScroller compact categories={categories} />
          </div>
          <CategoriesIntro />
          <div className="mt-8">
            <AvailableProductsSection
              productsQuery={productsQuery}
              getCartLineQuantity={getCartLineQuantity}
              onCartLineQuantityChange={onCartLineQuantityChange}
              router={router}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export function CategoriesPageContent() {
  const router = useRouter();
  const query = useCategories();
  const productParams = useMemo(
    () => ({
      page: DEFAULT_PAGE,
      per_page: 12,
      orderby: "popularity" as const,
      order: "desc" as const,
    }),
    [],
  );
  const productsQuery = useProducts(productParams);
  const { items, setProductLineQuantity } = useCart();
  const getCartLineQuantity = useCallback(
    (productId: number) => items.find((i) => i.productId === productId)?.quantity ?? 0,
    [items],
  );

  const categoriesData = query.data;
  const hasCategories = Boolean(categoriesData?.length);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Container className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-10">
        {query.isLoading ? (
          <div className="mt-6">
            <CategoriesIntro />
            <div className="mt-8">
              <CategoryScrollerSkeleton />
            </div>
          </div>
        ) : query.isError ? (
          <div className="mt-6">
            <CategoriesIntro />
            <div className="mt-8">
              <ErrorState
                message={query.error.message}
                onRetry={() => void query.refetch()}
              />
            </div>
          </div>
        ) : !hasCategories || !categoriesData ? (
          <div className="mt-6">
            <CategoriesIntro />
            <div className="mt-8">
              <EmptyState
                title="لا توجد تصنيفات"
                description="حاول لاحقاً أو تواصل مع الدعم."
              />
            </div>
          </div>
        ) : (
          <CategoriesSplitLayout
            categories={categoriesData}
            productsQuery={productsQuery}
            getCartLineQuantity={getCartLineQuantity}
            onCartLineQuantityChange={setProductLineQuantity}
            router={router}
          />
        )}
      </Container>
    </div>
  );
}
