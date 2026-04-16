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
  } = useProductsCatalog();

  return (
    <Container className="py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-brand-950 sm:text-2xl md:text-3xl">
            المنتجات
          </h1>
          <p className="text-sm text-muted-foreground">
            تصفح كامل الكتالوج مع البحث والتصفية.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <PillFilter active={allActive} onClick={() => pushFilters({ clear: true })}>
          الكل
        </PillFilter>
        <PillFilter
          active={isFeatured}
          onClick={() => pushFilters({ featured: true })}
        >
          مميز
        </PillFilter>
        {categoriesQuery.data?.map((category) => (
          <PillFilter
            key={category.id}
            active={activeCategoryId === category.id}
            onClick={() => pushFilters({ category: category.id })}
          >
            {category.name}
          </PillFilter>
        ))}
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
            onAddToCart={addProductToCart}
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
        )}
      </div>
    </Container>
  );
}
