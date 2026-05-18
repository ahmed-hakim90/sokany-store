"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Container } from "@/components/Container";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { CategoryBrowseSplitLayout } from "@/features/categories/components/category-browse-split-layout";
import { CategoryScrollerSkeleton } from "@/features/categories/components/CategoryScrollerSkeleton";
import { StickyBelowHeaderRail } from "@/features/categories/components/sticky-below-header-rail";
import { useCategories } from "@/features/categories/hooks/useCategories";
import type { Category } from "@/features/categories/types";
import {
  findCategoryBySlug,
  getCategoryHorizontalNavCategories,
  getTopLevelCategories,
} from "@/features/catalog/lib/catalog-category-tree";

function activeSlugFromPathname(pathname: string): string {
  if (pathname === "/categories" || pathname === "/categories/") return "";
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "categories") return "";
  return parts[1] ?? "";
}

function sidebarCategoriesList(data: Category[]) {
  return data.filter((c) => c.count > 0);
}

function mobileRailCategoriesList(data: Category[], activeSlug: string): Category[] {
  const sidebar = sidebarCategoriesList(data);
  /** مطابقة صفحة المنتجات / «وصل حديثاً»: على الفهرس السكة = تصنيفات المستوى الأعلى فقط — لا القائمة المسطّحة كاملة. */
  if (!activeSlug) return getTopLevelCategories(sidebar);
  const active = findCategoryBySlug(data, activeSlug);
  if (!active) return sidebar;
  const peers = getCategoryHorizontalNavCategories(data, active);
  return peers.length > 0 ? peers : sidebar;
}

export default function CategoriesLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeSlug = activeSlugFromPathname(pathname);
  const query = useCategories({ per_page: 100 });
  const sidebarCategories = useMemo(
    () => (query.data ? sidebarCategoriesList(query.data) : []),
    [query.data],
  );
  const railCategories = useMemo(
    () => (query.data ? mobileRailCategoriesList(query.data, activeSlug) : []),
    [query.data, activeSlug],
  );
  const activeCategory = useMemo(() => {
    if (!query.data || !activeSlug) return null;
    return findCategoryBySlug(query.data, activeSlug);
  }, [query.data, activeSlug]);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Container className="flex min-h-0 flex-1 flex-col px-3 sm:px-2 lg:px-6 lg:py-6">
        {query.isPending ? (
          <div className="mt-6 flex min-h-0 flex-1 flex-col gap-3">
            <StickyBelowHeaderRail>
              <CategoryScrollerSkeleton />
            </StickyBelowHeaderRail>
            <div className="min-w-0">{children}</div>
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
            categories={sidebarCategories}
            mobileRailCategories={railCategories}
            activeSlug={activeSlug}
            showNavChrome
            mobileRailLinkMode="productsQuery"
            mobileRailActiveCategoryId={activeCategory?.id ?? null}
            mobileRailAllProductsActive={!activeSlug}
            renderMainContent={() => children}
          />
        )}
      </Container>
    </div>
  );
}
