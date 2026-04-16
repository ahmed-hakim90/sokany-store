"use client";

import { Container } from "@/components/Container";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { CategoryScroller } from "@/features/categories/components/CategoryScroller";
import { CategoryScrollerSkeleton } from "@/features/categories/components/CategoryScrollerSkeleton";
import { CategorySidebar } from "@/features/categories/components/CategorySidebar";

export function CategoriesPageContent() {
  const query = useCategories();

  return (
    <Container className="py-10">
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-brand-950 sm:text-2xl md:text-3xl">
          التصنيفات
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          تصفّح الأقسام وانتقل إلى المنتجات بسرعة.
        </p>
      </div>

      <div className="mt-8">
        {query.isLoading ? (
          <CategoryScrollerSkeleton />
        ) : query.isError ? (
          <ErrorState
            message={query.error.message}
            onRetry={() => void query.refetch()}
          />
        ) : !query.data || query.data.length === 0 ? (
          <EmptyState
            title="لا توجد تصنيفات"
            description="حاول لاحقاً أو تواصل مع الدعم."
          />
        ) : (
          <>
            <div className="mb-8">
              <CategoryScroller compact categories={query.data} />
            </div>
            <aside className="hidden lg:block lg:max-w-[220px]">
              <CategorySidebar categories={query.data} />
            </aside>
          </>
        )}
      </div>
    </Container>
  );
}
