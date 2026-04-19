"use client";

import type { ReactNode } from "react";
import { CategorySidebar } from "@/features/categories/components/CategorySidebar";
import type { Category } from "@/features/categories/types";
import { cn } from "@/lib/utils";

export type CategoryBrowseSplitLayoutProps = {
  categories: Category[];
  activeSlug: string;
  showNavChrome: boolean;
  /** يُعرض فوق المحتوى الرئيسي من `lg` فما فوق (مثلاً فلاتر إضافية). */
  desktopTopContent?: ReactNode;
  /** يُستدعى مرة واحدة؛ استخدم `hidden lg:block` داخل المحتوى عند الحاجة. */
  renderMainContent: () => ReactNode;
};

export function CategoryBrowseSplitLayout({
  categories,
  activeSlug,
  showNavChrome,
  desktopTopContent,
  renderMainContent,
}: CategoryBrowseSplitLayoutProps) {
  const main = renderMainContent();

  return (
    <>
      {/*
       * تحت lg: عمود — شريط تصنيفات أفقي ثم منطقة رئيسية قابلة للتمرير العمودي داخل max-h-mobile-catalog-split.
       * من lg: شبكة — sidebar عمودي + عمود المحتوى (مع desktopTopContent اختياري).
       */}
      <div
        className={cn(
          "flex min-h-0 max-h-mobile-catalog-split flex-1 flex-col gap-4 lg:max-h-none",
        )}
      >
        {showNavChrome ? (
          <div className="w-full min-w-0 shrink-0 lg:hidden">
            <CategorySidebar
              categories={categories}
              activeSlug={activeSlug}
              variant="rail"
            />
          </div>
        ) : null}
        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col gap-4 lg:grid lg:items-start lg:gap-8",
            showNavChrome
              ? "lg:grid-cols-[minmax(160px,180px)_minmax(0,1fr)]"
              : "lg:grid-cols-1",
          )}
        >
          {showNavChrome ? (
            <aside className="mb-8 hidden lg:block">
              <CategorySidebar categories={categories} activeSlug={activeSlug} />
            </aside>
          ) : null}
          <div
            className={cn(
              "flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-y-contain pb-2 lg:overflow-visible lg:pb-0",
            )}
          >
            {showNavChrome && desktopTopContent ? (
              <div className="mb-8 hidden lg:block">{desktopTopContent}</div>
            ) : null}
            {main}
          </div>
        </div>
      </div>
    </>
  );
}
