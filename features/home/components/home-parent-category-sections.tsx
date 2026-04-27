"use client";

import { Link } from "next-view-transitions";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ErrorState } from "@/components/ErrorState";
import { ROUTES } from "@/lib/constants";
import type { Category } from "@/features/categories/types";
import type { Product } from "@/features/products/types";
import { HomeCategoryExclusiveBanner } from "@/features/home/components/home-category-exclusive-banner";
import { useHomeParentCategoryRails } from "@/features/home/hooks/useHomeParentCategoryRails";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { cn } from "@/lib/utils";

export type HomeParentCategorySectionsProps = {
  categories: Category[];
  /** ترتيب يطابق أقسام الأب — صورة اختيارية ومسار اختياري لكل قسم. */
  sectionBanners?: { imageUrl: string; href?: string }[];
  getCartLineQuantity: (productId: number) => number;
  onCartLineQuantityChange: (product: Product, next: number) => void;
};

/** هيكل تحميل يحجز مساحة أقسام الأب (بانر + شبكة) أثناء انتظار قائمة التصنيفات من الـ API. */
export function HomeParentCategorySectionsSkeleton({
  sections = 2,
  getCartLineQuantity,
  onCartLineQuantityChange,
}: Pick<
  HomeParentCategorySectionsProps,
  "getCartLineQuantity" | "onCartLineQuantityChange"
> & { sections?: number }) {
  return (
    <div
      className="space-y-10 sm:space-y-12"
      aria-busy="true"
      aria-label="جاري تحميل أقسام التصنيفات"
    >
      {Array.from({ length: sections }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="h-36 w-full animate-shimmer rounded-2xl bg-gradient-to-r from-image-well via-surface-muted to-image-well bg-[length:200%_100%] sm:h-40" />
          <section className="space-y-3 rounded-2xl">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="h-5 w-40 animate-shimmer rounded bg-border/80 sm:h-6 sm:w-48" />
              <div className="h-3 w-24 animate-shimmer rounded bg-border/60" />
            </div>
            <ProductGrid
              status="loading"
              products={[]}
              getCartLineQuantity={getCartLineQuantity}
              onCartLineQuantityChange={onCartLineQuantityChange}
              cardVariant="mobileCompact"
              cardVariantMd="desktopCatalogWide"
              gridClassName="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5"
            />
          </section>
        </div>
      ))}
    </div>
  );
}

export function HomeParentCategorySections({
  categories,
  sectionBanners = [],
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
        const banner = sectionBanners[i];
        const sectionBannerSrc = banner?.imageUrl ?? null;
        const bannerHref = banner?.href;

        return (
          <ScrollReveal key={cat.id} className="space-y-4">
            <HomeCategoryExclusiveBanner
              category={bannerCategory}
              sectionBannerSrc={sectionBannerSrc}
              bannerHref={bannerHref}
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

              {status === "error" ? (
                <ErrorState
                  message={
                    q.error instanceof Error ? q.error.message : "تعذر تحميل المنتجات"
                  }
                  onRetry={() => void q.refetch()}
                />
              ) : (
                <ProductGrid
                  status={status === "loading" ? "loading" : "ready"}
                  products={q.data ?? []}
                  getCartLineQuantity={getCartLineQuantity}
                  onCartLineQuantityChange={onCartLineQuantityChange}
                  cardVariant="mobileCompact"
                  cardVariantMd="desktopCatalogWide"
                  gridClassName="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5"
                />
              )}
            </section>
          </ScrollReveal>
        );
      })}
    </div>
  );
}
