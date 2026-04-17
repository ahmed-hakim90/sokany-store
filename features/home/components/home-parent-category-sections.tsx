"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import type { Category } from "@/features/categories/types";
import type { Product } from "@/features/products/types";
import { HomeCategoryExclusiveBanner } from "@/features/home/components/home-category-exclusive-banner";
import { ProductHorizontalRail } from "@/features/home/components/product-horizontal-rail";
import { useHomeParentCategoryRails } from "@/features/home/hooks/useHomeParentCategoryRails";
import { cn } from "@/lib/utils";

export type HomeParentCategorySectionsProps = {
  categories: Category[];
  /** Ordered `/images/banner-section/01.*`, `02.*`, … — index matches parent section order. */
  sectionBannerImages?: string[];
  getCartLineQuantity: (productId: number) => number;
  onCartLineQuantityChange: (product: Product, next: number) => void;
};

export function HomeParentCategorySections({
  categories,
  sectionBannerImages = [],
  getCartLineQuantity,
  onCartLineQuantityChange,
}: HomeParentCategorySectionsProps) {
  const { parents, queries } = useHomeParentCategoryRails(categories);

  if (parents.length === 0) return null;

  return (
    <div className="space-y-10 sm:space-y-12">
      {parents.map((cat, i) => {
        const q = queries[i];
        if (!q) return null;

        if (q.isSuccess && (!q.data || q.data.length === 0)) {
          return null;
        }

        const status = q.isError
          ? ("error" as const)
          : q.isPending
            ? ("loading" as const)
            : ("ready" as const);
        const bannerCategory = {
          ...cat,
          image: cat.image ?? q.data?.[0]?.thumbnail ?? "/images/placeholder.png",
        };
        const sectionBannerSrc = sectionBannerImages[i] ?? null;

        return (
          <div key={cat.id} className="space-y-4">
            <HomeCategoryExclusiveBanner
              category={bannerCategory}
              sectionBannerSrc={sectionBannerSrc}
            />

            <section
              className={cn(
                "space-y-3 rounded-2xl ",
              )}
              aria-labelledby={`home-cat-${cat.id}-title`}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <h2
                  id={`home-cat-${cat.id}-title`}
                  className="text-base font-bold tracking-tight text-black sm:text-lg md:text-xl"
                >
                  {cat.name}
                </h2>
                <Link
                  href={ROUTES.CATEGORY(cat.slug)}
                  className="text-xs font-semibold text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline sm:text-sm"
                >
                  عرض الكل
                </Link>
              </div>

              <ProductHorizontalRail
                status={status}
                products={q.data}
                getCartLineQuantity={getCartLineQuantity}
                onCartLineQuantityChange={onCartLineQuantityChange}
                errorMessage={
                  q.isError
                    ? q.error instanceof Error
                      ? q.error.message
                      : "تعذر تحميل المنتجات"
                    : undefined
                }
                onRetry={() => void q.refetch()}
                aria-label={`منتجات قسم ${cat.name}`}
                className="-mx-4 sm:mx-0"
              />
            </section>
          </div>
        );
      })}
    </div>
  );
}
