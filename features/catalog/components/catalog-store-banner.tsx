"use client";

import { Link } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import type { Category } from "@/features/categories/types";
import { HomeCategoryExclusiveBanner } from "@/features/home/components/home-category-exclusive-banner";
import { surfacePanelClass } from "@/lib/storefront-surfaces";
import {
  CMS_DEFAULT_PRODUCTS_CATALOG_BANNER,
  type CmsProductsCatalogBanner,
} from "@/schemas/cms";
import { cn } from "@/lib/utils";

const FALLBACK_IMAGE = "/images/banner-section/01-kitchen.jpeg";

export type CatalogStoreBannerProps = {
  /** عند غياب ?category= — بانر عام للمتجر */
  showDefaultBanner?: boolean;
  /** تصنيف مُحدَّد من ?category= */
  selectedCategory?: Category | null;
  /** من `site_config.productsCatalogBanner` — لوحة التحكم */
  catalogBanner?: CmsProductsCatalogBanner;
  className?: string;
};

/*
 * بانر الكتالوج:
 * — بدون تصنيف: صورة ونصوص من CMS (أو الافتراضي).
 * — مع تصنيف: بانر التصنيف + الوصف إن وُجد.
 */
export function CatalogStoreBanner({
  showDefaultBanner = true,
  selectedCategory = null,
  catalogBanner = CMS_DEFAULT_PRODUCTS_CATALOG_BANNER,
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

  if (!showDefaultBanner || !catalogBanner.enabled) return null;

  const imageSrc = catalogBanner.imageUrl.trim() || FALLBACK_IMAGE;
  const eyebrow = catalogBanner.eyebrow?.trim();
  const title = catalogBanner.title.trim();
  const description = catalogBanner.description?.trim();
  const href = catalogBanner.href?.trim();

  const visual = (
    <div className="relative aspect-[16/5] w-full bg-image-well">
      <AppImage
        src={imageSrc}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) min(90vw, 896px), min(72rem, 100vw)"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-8 sm:px-6 sm:pb-5">
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-wide text-white/80">
            {eyebrow}
          </p>
        ) : null}
        <p className="mt-1 font-display text-base font-bold text-white sm:text-lg">{title}</p>
        {description ? (
          <p className="mt-1 max-w-xl text-xs text-white/85 sm:text-sm">{description}</p>
        ) : null}
      </div>
    </div>
  );

  return (
    <section
      className={cn(
        "relative isolate min-w-0 overflow-hidden rounded-2xl",
        surfacePanelClass,
        className,
      )}
      aria-label={title || "كتالوج منتجات سوكاني"}
    >
      {href ? (
        <Link
          href={href}
          className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          {visual}
        </Link>
      ) : (
        visual
      )}
    </section>
  );
}
