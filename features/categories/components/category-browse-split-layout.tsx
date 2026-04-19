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
       * تحت lg: عمود — شريط تصنيفات أفقي ثم منطقة رئيسية قابلة للتمرير داخل max-h-mobile-catalog-split.
       * من lg: شبكة بعرض كامل — sidebar + محتوى بدون حد أقصى للارتفاع حتى يبقى الفوتر أسفل الصفحة.
       */}
      <div
        className={cn(
          /* أقل من lg: ارتفاع أقصى للكتالوج مع الشريط السفلي للموبايل — من lg فصاعداً لا نحد الارتفاع حتى لا يُضغط المحتوى ويظهر الفوتر بصرياً في منتصف الصفحة */
          "flex min-h-0 flex-1 flex-col gap-4 max-lg:max-h-mobile-catalog-split sm:px-2 lg:px-1",
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
