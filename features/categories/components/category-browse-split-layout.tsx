"use client";

import type { ReactNode } from "react";
import { CategoryCatalogRail } from "@/features/categories/components/category-catalog-rail";
import { CategorySidebar } from "@/features/categories/components/CategorySidebar";
import type { Category } from "@/features/categories/types";
import { cn } from "@/lib/utils";

type Viewport = "mobile" | "desktop";

export type CategoryBrowseSplitLayoutProps = {
  categories: Category[];
  activeSlug: string;
  showNavChrome: boolean;
  desktopTopContent?: ReactNode;
  renderMainContent: (viewport: Viewport) => ReactNode;
};

export function CategoryBrowseSplitLayout({
  categories,
  activeSlug,
  showNavChrome,
  desktopTopContent,
  renderMainContent,
}: CategoryBrowseSplitLayoutProps) {
  return (
    <>
      <div className="flex min-h-0 max-h-mobile-catalog-split flex-1 flex-row gap-2 lg:hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-y-contain pb-2">
          {renderMainContent("mobile")}
        </div>
        {showNavChrome ? (
          <CategoryCatalogRail categories={categories} linkMode="slug" activeSlug={activeSlug} />
        ) : null}
      </div>

      <div
        className={cn(
          "hidden min-w-0 lg:grid lg:items-start lg:gap-8",
          showNavChrome
            ? "lg:grid-cols-[minmax(160px,180px)_minmax(0,1fr)]"
            : "lg:grid-cols-1",
        )}
      >
        {showNavChrome ? (
          <aside className="mb-8">
            <CategorySidebar categories={categories} activeSlug={activeSlug} />
          </aside>
        ) : null}
        <div className="min-w-0">
          {showNavChrome && desktopTopContent ? <div className="mb-8">{desktopTopContent}</div> : null}
          {renderMainContent("desktop")}
        </div>
      </div>
    </>
  );
}
