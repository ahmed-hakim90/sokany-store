"use client";

import { Link } from "next-view-transitions";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ErrorState } from "@/components/ErrorState";
import { StorefrontStaleDataNotice } from "@/components/storefront-stale-data-notice";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useNearViewport } from "@/hooks/useNearViewport";
import { ROUTES } from "@/lib/constants";
import type { Category } from "@/features/categories/types";
import type { Product } from "@/features/products/types";
import { HomeCategoryExclusiveBanner } from "@/features/home/components/home-category-exclusive-banner";
import { HomeProductRailPlaceholder } from "@/features/home/components/home-product-rail-placeholder";
import {
  HOME_RAIL_PER_PAGE,
  homeParentCategoryRailParams,
} from "@/features/home/lib/home-page-product-params";
import { parentCategoriesForHome } from "@/features/home/lib/parentCategoriesForHome";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { useProducts } from "@/features/products/hooks/useProducts";
import { cn } from "@/lib/utils";

export type HomeParentCategorySectionsProps = {
  categories: Category[];
  /** ترتيب يطابق أقسام الأب — صورة اختيارية ومسار اختياري لكل قسم. */
  sectionBanners?: { imageUrl: string; href?: string }[];
  getCartLineQuantity: (productId: number) => number;
  onCartLineQuantityChange: (product: Product, next: number) => void;
};

/** أثناء انتظار التصنيفات: عناصر خفيفة فقط (بدون ‎`ProductGrid`‎). */
export function HomeParentCategorySectionsSkeleton({
  sections = 2,
}: {
  sections?: number;
}) {
  return (
    <div
      className="space-y-8 sm:space-y-10"
      aria-busy="true"
      aria-label="جاري تحميل أقسام التصنيفات"
    >
      {Array.from({ length: sections }).map((_, i) => (
        <HomeProductRailPlaceholder key={i} aria-label="قسم تصنيف" />
      ))}
    </div>
  );
}

function HomeParentCategoryRow({
  cat,
  sectionBanner,
  getCartLineQuantity,
  onCartLineQuantityChange,
}: {
  cat: Category;
  sectionBanner?: { imageUrl: string; href?: string };
  getCartLineQuantity: (productId: number) => number;
  onCartLineQuantityChange: (product: Product, next: number) => void;
}) {
  const { offline } = useNetworkStatus();
  const { ref, near } = useNearViewport();
  const params = homeParentCategoryRailParams(cat.id);
  const q = useProducts(params, { enabled: near });
  const items = q.data?.items ?? [];

  if (near && q.isSuccess && !items.length && !q.isError) {
    return null;
  }

  const sectionBannerSrc = sectionBanner?.imageUrl?.trim()
    ? sectionBanner.imageUrl.trim()
    : null;
  const bannerHref = sectionBanner?.href;

  const bannerCategory = {
    ...cat,
    image: cat.image ?? items[0]?.thumbnail ?? "/images/placeholder.png",
  };

  const stale =
    (q.data?.responseSource === "cache-fallback" && items.length > 0) ||
    (offline && items.length > 0) ||
    (q.isError && items.length > 0);
  const staleVariant =
    offline && items.length > 0 ? "offline-cache" : "api-fallback";

  const fatal = q.isError && !items.length;

  return (
    <ScrollReveal className="space-y-4">
      <div ref={ref} className="space-y-4">
        {!near ? (
          <HomeProductRailPlaceholder aria-label={cat.name} />
        ) : fatal ? (
          <ErrorState
            message={q.error instanceof Error ? q.error.message : "تعذر تحميل المنتجات"}
            onRetry={() => void q.refetch()}
          />
        ) : (
          <>
            <HomeCategoryExclusiveBanner
              category={bannerCategory}
              sectionBannerSrc={sectionBannerSrc}
              bannerHref={bannerHref}
            />

            <section
              className={cn("space-y-3 rounded-2xl")}
              aria-labelledby={`home-cat-${cat.id}-title`}
            >
              {stale ? <StorefrontStaleDataNotice variant={staleVariant} /> : null}
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

              <ProductGrid
                status={q.isPending ? "loading" : "ready"}
                products={items}
                skeletonCount={HOME_RAIL_PER_PAGE}
                priorityImageSlots={0}
                simpleImageMode
                imageMotion={false}
                imageInteractions={false}
                getCartLineQuantity={getCartLineQuantity}
                onCartLineQuantityChange={onCartLineQuantityChange}
                cardVariant="mobileCompact"
                cardVariantMd="desktopCatalogWide"
                gridClassName="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5"
              />
            </section>
          </>
        )}
      </div>
    </ScrollReveal>
  );
}

export function HomeParentCategorySections({
  categories,
  sectionBanners = [],
  getCartLineQuantity,
  onCartLineQuantityChange,
}: HomeParentCategorySectionsProps) {
  const parents = parentCategoriesForHome(categories);

  if (parents.length === 0) return null;

  return (
    <div className="space-y-10 sm:space-y-12">
      {parents.map((cat, i) => (
        <HomeParentCategoryRow
          key={cat.id}
          cat={cat}
          sectionBanner={sectionBanners[i]}
          getCartLineQuantity={getCartLineQuantity}
          onCartLineQuantityChange={onCartLineQuantityChange}
        />
      ))}
    </div>
  );
}
