"use client";

import type { ReactNode } from "react";
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
      {/*
       * الجوال: RTL — العمود الأول يميناً: تصنيفات ⅓، المحتوى ⅔.
       */}
      <div
        className={cn(
          "grid min-h-0 max-h-mobile-catalog-split flex-1 items-start gap-2 lg:hidden",
          showNavChrome ? "grid-cols-3" : "grid-cols-1",
        )}
      >
        {showNavChrome ? (
          <aside className="col-span-1 min-h-0 min-w-0 self-start overflow-y-auto overscroll-y-contain py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <CategorySidebar categories={categories} activeSlug={activeSlug} compact />
          </aside>
        ) : null}
        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-col gap-4 overflow-y-auto overscroll-y-contain pb-2",
            showNavChrome ? "col-span-2" : "col-span-1",
          )}
        >
          {renderMainContent("mobile")}
        </div>
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
