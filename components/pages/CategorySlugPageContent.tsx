"use client";

import { useMemo, useState } from "react";
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
import { useProducts } from "@/features/products/hooks/useProducts";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductSkeleton } from "@/features/products/components/ProductSkeleton";
import { SearchField } from "@/components/ui/search-field";

export function CategorySlugPageContent({ slug }: { slug: string }) {
  const router = useRouter();
  const [listSearch, setListSearch] = useState("");
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
  const { addProduct } = useCart();

  const submitCategorySearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = categoryQuery.data?.id;
    if (!id) return;
    const q = listSearch.trim();
    router.push(
      q
        ? `${ROUTES.PRODUCTS}?category=${id}&search=${encodeURIComponent(q)}`
        : `${ROUTES.PRODUCTS}?category=${id}`,
    );
  };

  return (
    <Container className="py-10">
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
        <div className="lg:grid lg:grid-cols-[minmax(200px,220px)_1fr] lg:items-start lg:gap-8">
          {categoriesNav.data && categoriesNav.data.length > 0 ? (
            <aside className="mb-8 hidden lg:block">
              <CategorySidebar
                categories={categoriesNav.data}
                activeSlug={slug}
              />
            </aside>
          ) : null}
          <div>
            {categoriesNav.data && categoriesNav.data.length > 0 ? (
              <div className="mb-8 lg:hidden">
                <CategoryScroller compact categories={categoriesNav.data} />
              </div>
            ) : null}
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-brand-950 sm:text-3xl">
                {categoryQuery.data.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-700">
                {categoryQuery.data.description}
              </p>
              <form
                onSubmit={submitCategorySearch}
                className="mt-6 flex max-w-xl flex-col gap-2 sm:flex-row sm:items-stretch"
              >
                <SearchField
                  className="flex-1"
                  placeholder="ابحث داخل هذا التصنيف (في صفحة المنتجات)…"
                  value={listSearch}
                  onChange={(ev) => setListSearch(ev.target.value)}
                  aria-label="بحث في التصنيف"
                />
                <Button type="submit" variant="secondary" className="shrink-0 sm:w-auto">
                  بحث
                </Button>
              </form>
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
                  onAddToCart={addProduct}
                  empty={
                    <EmptyState
                      title="No products in this category"
                      description="Try another category or browse all products."
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
      )}
    </Container>
  );
}
