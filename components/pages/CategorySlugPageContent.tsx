"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { useCart } from "@/hooks/useCart";
import { ROUTES } from "@/lib/constants";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useCategory } from "@/features/categories/hooks/useCategory";
import { CategoryScroller } from "@/features/categories/components/CategoryScroller";
import { CategorySidebar } from "@/features/categories/components/CategorySidebar";
import { CategoryCatalogRail } from "@/features/categories/components/category-catalog-rail";
import { useProducts } from "@/features/products/hooks/useProducts";
import { CatalogPromoTile } from "@/features/catalog/components/catalog-promo-tile";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductSkeleton } from "@/features/products/components/ProductSkeleton";

export function CategorySlugPageContent({ slug }: { slug: string }) {
  const router = useRouter();
  const categoryQuery = useCategory(slug);
  const categoriesNav = useCategories();

  const categoryId = categoryQuery.data?.id;
  const productParams = useMemo(
    () =>
      categoryId
        ? { category: categoryId, per_page: 12, page: 1 }
        : undefined,
    [categoryId],
  );

  const productsQuery = useProducts(productParams, {
    enabled: Boolean(categoryId),
  });
  const { items, setProductLineQuantity } = useCart();
  const getCartLineQuantity = useCallback(
    (productId: number) => items.find((i) => i.productId === productId)?.quantity ?? 0,
    [items],
  );

  const navCategories = categoriesNav.data;
  const hasNavCategories = Boolean(navCategories?.length);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Container className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-10">
        {categoryQuery.isLoading ? (
          <div className="space-y-8">
            <div className="h-10 w-1/3 animate-shimmer rounded bg-brand-100" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : categoryQuery.isError ? (
          <ErrorState
            message={categoryQuery.error.message}
            onRetry={() => void categoryQuery.refetch()}
          />
        ) : !categoryQuery.data ? (
          <EmptyState
            title="التصنيف غير موجود"
            description="تصفح جميع التصنيفات من القائمة."
            action={
              <Button type="button" onClick={() => router.push(ROUTES.CATEGORIES)}>
                كل التصنيفات
              </Button>
            }
          />
        ) : (
          <>
            <div className="flex min-h-0 max-h-[calc(100dvh-7rem-var(--mobile-commerce-chrome-height))] flex-1 flex-row gap-2 lg:hidden">
              <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-y-contain pb-2">
                <div>
                  <h1 className="font-display text-xl font-bold tracking-tight text-brand-950 sm:text-2xl md:text-3xl">
                    {categoryQuery.data.name}
                  </h1>
                  <p className="mt-2 max-w-2xl break-words text-sm text-zinc-700">
                    {categoryQuery.data.description}
                  </p>
                  <p className="mt-6">
                    <Link
                      href={`${ROUTES.PRODUCTS}?category=${categoryQuery.data.id}`}
                      className="text-sm font-semibold text-brand-900 underline-offset-4 hover:underline"
                    >
                      تصفح كل المنتجات في هذا التصنيف
                    </Link>
                  </p>
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
                    onCartLineQuantityChange={setProductLineQuantity}
                    cardVariant="mobileCompact"
                    cardVariantMd="desktopCatalogWide"
                    leadingSlot={<CatalogPromoTile />}
                    gridClassName="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3"
                    empty={
                      <EmptyState
                        title="لا توجد منتجات في هذا التصنيف"
                        description="جرّب تصنيفاً آخر أو تصفح كل المنتجات."
                        action={
                          <Button type="button" onClick={() => router.push(ROUTES.PRODUCTS)}>
                            تصفح المنتجات
                          </Button>
                        }
                      />
                    }
                  />
                )}
              </div>
              {hasNavCategories && navCategories ? (
                <CategoryCatalogRail
                  categories={navCategories}
                  linkMode="slug"
                  activeSlug={slug}
                />
              ) : null}
            </div>

            <div className="hidden min-w-0 lg:grid lg:grid-cols-[minmax(200px,220px)_minmax(0,1fr)] lg:items-start lg:gap-8">
              {hasNavCategories && navCategories ? (
                <aside className="mb-8">
                  <CategorySidebar categories={navCategories} activeSlug={slug} />
                </aside>
              ) : null}
              <div className="min-w-0">
                {hasNavCategories && navCategories ? (
                  <div className="mb-8">
                    <CategoryScroller compact categories={navCategories} />
                  </div>
                ) : null}
                <div>
                  <h1 className="font-display text-xl font-bold tracking-tight text-brand-950 sm:text-2xl md:text-3xl">
                    {categoryQuery.data.name}
                  </h1>
                  <p className="mt-2 max-w-2xl break-words text-sm text-zinc-700">
                    {categoryQuery.data.description}
                  </p>
                  <p className="mt-6">
                    <Link
                      href={`${ROUTES.PRODUCTS}?category=${categoryQuery.data.id}`}
                      className="text-sm font-semibold text-brand-900 underline-offset-4 hover:underline"
                    >
                      تصفح كل المنتجات في هذا التصنيف
                    </Link>
                  </p>
                </div>

                <div className="mt-8">
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
                      onCartLineQuantityChange={setProductLineQuantity}
                      cardVariant="mobileCompact"
                      cardVariantMd="desktopCatalogWide"
                      leadingSlot={<CatalogPromoTile />}
                      gridClassName="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3"
                      empty={
                        <EmptyState
                          title="لا توجد منتجات في هذا التصنيف"
                          description="جرّب تصنيفاً آخر أو تصفح كل المنتجات."
                          action={
                            <Button type="button" onClick={() => router.push(ROUTES.PRODUCTS)}>
                              تصفح المنتجات
                            </Button>
                          }
                        />
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </Container>
    </div>
  );
}
