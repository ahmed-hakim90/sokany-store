"use client";

import type { ReactNode } from "react";
import { CatalogFilterForm } from "@/features/catalog/components/catalog-filter-form";
import { CatalogSidebarTree } from "@/features/catalog/components/catalog-sidebar-tree";
import { buildCategoryTree } from "@/features/catalog/lib/catalog-category-tree";
import { StickyBelowHeaderRail } from "@/features/categories/components/sticky-below-header-rail";
import type { Category } from "@/features/categories/types";
import { surfacePanelClass } from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";

export type CatalogListingLayoutProps = {
  children: ReactNode;
  /** شريط اكتشاف التصنيفات على الموبايل */
  mobileDiscovery?: ReactNode;
  /** رأس الصفحة (هيرو/عنوان) */
  header?: ReactNode;
  /** مسار تنقّل */
  breadcrumb?: ReactNode;
  /** بانر المتجر أو التصنيف */
  banner?: ReactNode;
  /** تصنيفات فرعية */
  childCategories?: ReactNode;
  categories?: Category[];
  activeCategoryId?: number | null;
  allProductsActive?: boolean;
  activeSlug?: string;
  categoryLinkMode?: "productsQuery" | "slug";
  showFilter?: boolean;
  showDesktopSidebar?: boolean;
  sidebarLoading?: boolean;
  sidebarSkeleton?: ReactNode;
  className?: string;
};

/*
 * غلاف قوائم المنتجات (/products):
 * — الجوال (< lg): رأس هيرو (عنوان + ترتيب) → سكة لاصقة → بانر → شبكة؛ التصفية من الهيدر + درج الفلتر.
 * — من lg: عمود شجرة تصنيفات + فلتر ثابت | عمود رئيسي (رأس، شبكة).
 */
export function CatalogListingLayout({
  children,
  mobileDiscovery,
  header,
  breadcrumb,
  banner,
  childCategories,
  categories = [],
  activeCategoryId,
  allProductsActive,
  categoryLinkMode = "productsQuery",
  showFilter = true,
  showDesktopSidebar = true,
  sidebarLoading = false,
  sidebarSkeleton,
  className,
}: CatalogListingLayoutProps) {
  const showSidebar =
    showDesktopSidebar &&
    categoryLinkMode === "productsQuery" &&
    (sidebarLoading || categories.length > 0);
  const categoryTree = buildCategoryTree(categories);

  return (
    <div className={cn("flex min-w-0 flex-1 flex-col gap-3 sm:gap-4", className)}>
      {header}

      {breadcrumb ? <div className="min-w-0">{breadcrumb}</div> : null}

      {mobileDiscovery ? (
        <div className="min-w-0 lg:hidden">
          <StickyBelowHeaderRail>{mobileDiscovery}</StickyBelowHeaderRail>
        </div>
      ) : null}

      {banner ? <div className="min-w-0">{banner}</div> : null}

      {childCategories ? <div className="min-w-0">{childCategories}</div> : null}

      <div
        className={cn(
          "grid min-w-0 flex-1 gap-4 lg:items-start lg:gap-8",
          showSidebar
            ? "lg:grid-cols-[minmax(200px,240px)_minmax(0,1fr)]"
            : "lg:grid-cols-1",
        )}
      >
        {showSidebar ? (
          <aside className="hidden min-w-0 space-y-4 lg:sticky lg:top-24 lg:block lg:self-start">
            {sidebarLoading && sidebarSkeleton ? (
              sidebarSkeleton
            ) : (
              <>
                <div className={cn(surfacePanelClass, "p-3")}>
                  <p className="mb-2 text-xs font-bold text-muted-foreground">التصنيفات</p>
                  <CatalogSidebarTree
                    tree={categoryTree}
                    activeCategoryId={activeCategoryId ?? null}
                    allProductsActive={allProductsActive}
                  />
                </div>
                {showFilter ? (
                  <div className={cn(surfacePanelClass, "p-3")}>
                    <p className="mb-3 text-xs font-bold text-muted-foreground">تصفية وترتيب</p>
                    <CatalogFilterForm layout="sidebar" />
                  </div>
                ) : null}
              </>
            )}
          </aside>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col gap-3 scroll-mt-2 sm:gap-4">
          {children}
        </div>
      </div>
    </div>
  );
}
