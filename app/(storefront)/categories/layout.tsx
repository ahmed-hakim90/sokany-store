"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Container } from "@/components/Container";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { CategoryBrowseSplitLayout } from "@/features/categories/components/category-browse-split-layout";
import { CategoriesMobileHeaderRail } from "@/features/categories/components/categories-mobile-header-rail";
import { CategoryTilesGrid } from "@/features/categories/components/category-tiles-grid";
import { CategoryScrollerSkeleton } from "@/features/categories/components/CategoryScrollerSkeleton";
import { featuredCategoryTiles } from "@/features/categories/content/featured-category-tiles";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { mergeFeaturedCategoryTilesWithApi } from "@/features/categories/lib/merge-featured-category-tiles";
import type { Category } from "@/features/categories/types";

function activeSlugFromPathname(pathname: string): string {
  if (pathname === "/categories" || pathname === "/categories/") return "";
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "categories") return "";
  return parts[1] ?? "";
}

function sidebarCategoriesList(data: Category[]) {
  return data.filter((c) => c.count > 0);
}

/*
 * تخطيط التصنيفات: على الموبايل سكة بلاطات أفقية (نفس شكل About، حجم مضغوط) تحت الهيدر؛
 * من lg شريط جانبي نصي + المحتوى داخل الحاوية.
 */
export default function CategoriesLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeSlug = activeSlugFromPathname(pathname);
  const query = useCategories({ per_page: 100 });
  const sidebarCategories = useMemo(
    () => (query.data ? sidebarCategoriesList(query.data) : []),
    [query.data],
  );
  const featuredTiles = useMemo(
    () => mergeFeaturedCategoryTilesWithApi(featuredCategoryTiles, query.data),
    [query.data],
  );

  const mobileRail =
    query.isPending ? (
      <CategoriesMobileHeaderRail>
        <CategoryScrollerSkeleton variant="tiles" />
      </CategoriesMobileHeaderRail>
    ) : query.data?.length ? (
      <CategoriesMobileHeaderRail>
        <CategoryTilesGrid
          tiles={featuredTiles}
          size="compact"
          layout="scroll-rail"
          title="تسوق حسب الفئة"
        />
      </CategoriesMobileHeaderRail>
    ) : null;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {mobileRail}
      <Container className="flex min-h-0 flex-1 flex-col px-3 sm:px-2 lg:px-6 lg:py-6">
        {query.isPending ? (
          <div className="min-w-0">{children}</div>
        ) : query.isError ? (
          <div className="mt-6 lg:mt-0">
            <ErrorState
              message={query.error.message}
              onRetry={() => void query.refetch()}
            />
            <div className="mt-8 min-w-0">{children}</div>
          </div>
        ) : !query.data?.length ? (
          <div className="mt-6 lg:mt-0">
            <EmptyState
              title="لا توجد تصنيفات"
              description="حاول لاحقاً أو تواصل مع الدعم."
            />
            <div className="mt-8 min-w-0">{children}</div>
          </div>
        ) : (
          <CategoryBrowseSplitLayout
            categories={sidebarCategories}
            activeSlug={activeSlug}
            showNavChrome
            showMobileRail={false}
            renderMainContent={() => children}
          />
        )}
      </Container>
    </div>
  );
}
