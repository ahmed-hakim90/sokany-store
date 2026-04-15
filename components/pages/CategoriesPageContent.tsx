"use client";

import { Container } from "@/components/Container";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { CategoryGrid } from "@/features/categories/components/CategoryGrid";
import { CategoryScroller } from "@/features/categories/components/CategoryScroller";
import { CategorySidebar } from "@/features/categories/components/CategorySidebar";
import { CategorySkeleton } from "@/features/categories/components/CategorySkeleton";

export function CategoriesPageContent() {
  const query = useCategories();

  return (
    <Container className="py-10">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-brand-950">
          Categories
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Browse collections and discover products faster.
        </p>
      </div>

      <div className="mt-8">
        {query.isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        ) : query.isError ? (
          <ErrorState
            message={query.error.message}
            onRetry={() => void query.refetch()}
          />
        ) : !query.data || query.data.length === 0 ? (
          <EmptyState
            title="No categories found"
            description="Please check back soon."
          />
        ) : (
          <div className="lg:grid lg:grid-cols-[minmax(200px,220px)_1fr] lg:items-start lg:gap-8">
            <aside className="mb-8 hidden lg:block">
              <CategorySidebar categories={query.data} />
            </aside>
            <div>
              <div className="mb-8 lg:hidden">
                <CategoryScroller compact categories={query.data} />
              </div>
              <CategoryGrid categories={query.data} />
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
