"use client";

import type { ReactNode } from "react";
import { CategorySidebar } from "@/features/categories/components/CategorySidebar";
import { StickyBelowHeaderRail } from "@/features/categories/components/sticky-below-header-rail";
import type { Category } from "@/features/categories/types";
import { cn } from "@/lib/utils";

export type CategoryBrowseSplitLayoutProps = {
  /** قائمة التصنيفات للشريط الجانبي على الديسكتوب (قائمة كاملة). */
  categories: Category[];
  /**
   * تصنيفات سكة الموبايل الأفقية؛ إن لم تُمرَّر، تُستخدم `categories`.
   * على مسارات slug يُفضَّل صف أبناء/إخوة بينما يبقى الشريط الجانبي بالقائمة الكاملة.
   */
  mobileRailCategories?: Category[];
  /**
   * سكة الموبايل: روابط `/products?category=` مثل الكتالوج و«وصل حديثاً»، أو روابط `/categories/...` الافتراضية.
   * الشريط الجانبي على lg يبقى بـ slug ما لم يُغيَّر لاحقاً.
   */
  mobileRailLinkMode?: "slug" | "productsQuery";
  mobileRailActiveCategoryId?: number | null;
  /** مع `productsQuery`: تمييز «الكل» على `/categories` بدون slug نشط. */
  mobileRailAllProductsActive?: boolean;
  activeSlug: string;
  showNavChrome: boolean;
  /** عند `false` تُعرض سكة الموبايل من `categories/layout` تحت الهيدر مباشرة. */
  showMobileRail?: boolean;
  /** يُعرض فوق المحتوى الرئيسي من `lg` فما فوق (مثلاً فلاتر إضافية). */
  desktopTopContent?: ReactNode;
  /** يُستدعى مرة واحدة؛ استخدم `hidden lg:block` داخل المحتوى عند الحاجة. */
  renderMainContent: () => ReactNode;
};

export function CategoryBrowseSplitLayout({
  categories,
  mobileRailCategories,
  mobileRailLinkMode = "slug",
  mobileRailActiveCategoryId = null,
  mobileRailAllProductsActive = false,
  activeSlug,
  showNavChrome,
  showMobileRail = true,
  desktopTopContent,
  renderMainContent,
}: CategoryBrowseSplitLayoutProps) {
  const main = renderMainContent();
  const railCategories = mobileRailCategories ?? categories;

  return (
    <>
      {/*
       * تحت lg: سكة بلاطات لاصقة (إن `showMobileRail`) — على `/categories` تُعرض من `categories/layout` تحت الهيدر مباشرة.
       * من lg: sidebar كامل بروابط `/categories/...`؛ المحتوى بدون حد أقصى للارتفاع حتى يبقى الفوتر أسفل الصفحة.
       */}
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-2 sm:px-2 lg:px-1",
        )}
      >
        {showNavChrome && showMobileRail ? (
          <div className="w-full min-w-0 shrink-0 lg:hidden">
            <StickyBelowHeaderRail>
              <CategorySidebar
                categories={railCategories}
                activeSlug={activeSlug}
                variant="rail"
                linkMode={mobileRailLinkMode}
                activeCategoryId={mobileRailActiveCategoryId}
                allProductsActive={mobileRailAllProductsActive}
              />
            </StickyBelowHeaderRail>
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
              "flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-visible pb-2 lg:pb-0",
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
