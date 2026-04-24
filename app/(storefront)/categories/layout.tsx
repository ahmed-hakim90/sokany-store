"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Container } from "@/components/Container";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { CategoryBrowseSplitLayout } from "@/features/categories/components/category-browse-split-layout";
import { CategoryScrollerSkeleton } from "@/features/categories/components/CategoryScrollerSkeleton";
import { useCategories } from "@/features/categories/hooks/useCategories";
import type { Category } from "@/features/categories/types";

function activeSlugFromPathname(pathname: string): string {
  if (pathname === "/categories" || pathname === "/categories/") return "";
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "categories") return "";
  return parts[1] ?? "";
}

function categoriesForNav(data: Category[], activeSlug: string) {
  if (!data.length) return [];
  const nonEmpty = data.filter((c) => c.count > 0);
  if (!activeSlug) return nonEmpty;
  if (nonEmpty.some((c) => c.slug === activeSlug)) return nonEmpty;
  const current = data.find((c) => c.slug === activeSlug);
  if (current) {
    return [current, ...nonEmpty.filter((c) => c.id !== current.id)];
  }
  return nonEmpty;
}

export default function CategoriesLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeSlug = activeSlugFromPathname(pathname);
  const query = useCategories({ per_page: 100 });
  const layoutCategories = useMemo(
    () => (query.data ? categoriesForNav(query.data, activeSlug) : []),
    [query.data, activeSlug],
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Container className="flex min-h-0 flex-1 flex-col sm:px-2 lg:px-8 lg:py-10">
        {query.isPending ? (
          <div className="mt-6">
            <div className="rounded-editorial border border-border/70 bg-white/90 py-0.5 shadow-sm backdrop-blur-sm">
              <CategoryScrollerSkeleton />
            </div>
            <div className="mt-6 min-w-0">{children}</div>
          </div>
        ) : query.isError ? (
          <div className="mt-6">
            <ErrorState
              message={query.error.message}
              onRetry={() => void query.refetch()}
            />
            <div className="mt-8 min-w-0">{children}</div>
          </div>
        ) : !query.data?.length ? (
          <div className="mt-6">
            <EmptyState
              title="لا توجد تصنيفات"
              description="حاول لاحقاً أو تواصل مع الدعم."
            />
            <div className="mt-8 min-w-0">{children}</div>
          </div>
        ) : (
          <CategoryBrowseSplitLayout
            categories={layoutCategories}
            activeSlug={activeSlug}
            showNavChrome
            renderMainContent={() => children}
          />
        )}
      </Container>
    </div>
  );
}
