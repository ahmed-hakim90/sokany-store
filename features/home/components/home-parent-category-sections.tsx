"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import { ErrorState } from "@/components/ErrorState";
import { StorefrontStaleDataNotice } from "@/components/storefront-stale-data-notice";
import { HomeResponsiveProductSection } from "@/features/home/components/home-responsive-product-section";
import { homeParentSectionSubtitle } from "@/features/home/lib/home-section-copy";
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
import { useProducts } from "@/features/products/hooks/useProducts";
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

            <HomeResponsiveProductSection
              staleNotice={
                stale ? <StorefrontStaleDataNotice variant={staleVariant} /> : null
              }
              header={{
                id: `home-cat-${cat.id}-title`,
                title: cat.name,
                subtitle: homeParentSectionSubtitle(cat.slug, cat.name),
                viewAllHref: ROUTES.CATEGORY(cat.slug),
              }}
              grid={{
                status: q.isPending ? "loading" : "ready",
                products: items,
                skeletonCount: HOME_RAIL_PER_PAGE,
                priorityImageSlots: 0,
                simpleImageMode: true,
                imageMotion: false,
                imageInteractions: false,
                getCartLineQuantity,
                onCartLineQuantityChange,
                cardVariant: "mobileCompact",
                cardVariantMd: "desktopCatalogWide",
                gridClassName:
                  "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5",
              }}
              rail={{
                status: "ready",
                "aria-label": cat.name,
                skeletonCount: HOME_RAIL_PER_PAGE,
              }}
            />
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
