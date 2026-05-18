"use client";

import { AppImage } from "@/components/AppImage";
import type { Category } from "@/features/categories/types";
import { HomeCategoryExclusiveBanner } from "@/features/home/components/home-category-exclusive-banner";
import { surfacePanelClass } from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";

const DEFAULT_CATALOG_BANNER = "/images/banner-section/01-kitchen.jpeg";

export type CatalogStoreBannerProps = {
  /** عند غياب ?category= — بانر عام للمتجر */
  showDefaultBanner?: boolean;
  /** تصنيف مُحدَّد من ?category= */
  selectedCategory?: Category | null;
  className?: string;
};

/*
 * بانر الكتالوج:
 * — بدون تصنيف: صورة حملة عامة + نص ترحيبي.
 * — مع تصنيف: بانر التصنيف + الوصف إن وُجد.
 */
export function CatalogStoreBanner({
  showDefaultBanner = true,
  selectedCategory = null,
  className,
}: CatalogStoreBannerProps) {
  if (selectedCategory) {
    const description = selectedCategory.description?.trim();
    return (
      <section className={cn("min-w-0 space-y-3", className)} aria-label={selectedCategory.name}>
        <HomeCategoryExclusiveBanner category={selectedCategory} />
        {description ? (
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </section>
    );
  }

  if (!showDefaultBanner) return null;

  return (
    <section
      className={cn(
        "relative isolate min-w-0 overflow-hidden rounded-2xl",
        surfacePanelClass,
        className,
      )}
      aria-label="كتالوج منتجات سوكاني"
    >
      <div className="relative aspect-[16/5] w-full bg-image-well">
        <AppImage
          src={DEFAULT_CATALOG_BANNER}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) min(90vw, 896px), min(72rem, 100vw)"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-8 sm:px-6 sm:pb-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/80">
            أجهزة منزلية أصلية
          </p>
          <p className="mt-1 font-display text-base font-bold text-white sm:text-lg">
            اكتشف تشكيلة سوكاني الكاملة
          </p>
          <p className="mt-1 max-w-xl text-xs text-white/85 sm:text-sm">
            مطبخ، عناية شخصية، وتنظيف — تصفّح حسب القسم أو استخدم الفلتر للوصول أسرع.
          </p>
        </div>
      </div>
    </section>
  );
}
