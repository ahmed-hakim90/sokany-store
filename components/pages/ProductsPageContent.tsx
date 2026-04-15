"use client";

import Link from "next/link";
import { Container } from "@/components/Container";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { PillFilter } from "@/components/ui/pill-filter";
import { SearchField } from "@/components/ui/search-field";
import { useProductsCatalog } from "@/hooks/useProductsCatalog";
import { ROUTES } from "@/lib/constants";
import { ProductGrid } from "@/features/products/components/ProductGrid";

export function ProductsPageContent() {
  const {
    searchDraft,
    setSearchDraft,
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
          <h1 className="font-display text-3xl font-bold tracking-tight text-brand-950">
            المنتجات
          </h1>
          <p className="text-sm text-muted-foreground">
            تصفح كامل الكتالوج مع البحث والتصفية.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchField
          className="max-w-xl flex-1"
          placeholder="ابحث عن منتج…"
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
          aria-label="بحث المنتجات"
          leading={
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" strokeLinecap="round" />
            </svg>
          }
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
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
