"use client";

import dynamic from "next/dynamic";
import { useTransitionRouter } from "next-view-transitions";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { StorefrontStaleDataNotice } from "@/components/storefront-stale-data-notice";
import { useCart } from "@/hooks/useCart";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useNearViewport } from "@/hooks/useNearViewport";
import { HomeBrandSupportGrid } from "@/features/home/components/home-brand-support-grid";
import { HomeCategoryDiscovery } from "@/features/home/components/home-category-discovery";
import { HomeHeroLayout } from "@/features/home/components/home-hero-layout";
import { HomeProductRailPlaceholder } from "@/features/home/components/home-product-rail-placeholder";
import { HomeResponsiveProductSection } from "@/features/home/components/home-responsive-product-section";
import { ROUTES } from "@/lib/constants";
import { useCategories } from "@/features/categories/hooks/useCategories";
import {
  HOME_BESTSELLERS_PRODUCT_PARAMS,
  HOME_CATEGORIES_QUERY_PARAMS,
  HOME_FLASH_SALE_PRODUCT_PARAMS,
  HOME_NEW_ARRIVALS_PRODUCT_PARAMS,
  HOME_RAIL_PER_PAGE,
} from "@/features/home/lib/home-page-product-params";
import { useProducts } from "@/features/products/hooks/useProducts";
import {
  CMS_DEFAULT_HOME_SPOTLIGHT_PLACEMENT,
  type CmsHomeFeatureVideo,
  type CmsHomeSpotlightPlacement,
} from "@/schemas/cms";
import type { HomeBottomPromo, HomePageContentProps } from "./home-page-types";

const ScrollReveal = dynamic(() =>
  import("@/components/ScrollReveal").then((m) => ({ default: m.ScrollReveal })),
);

const HomeFeatureVideo = dynamic(() =>
  import("@/features/home/components/home-feature-video").then((m) => ({
    default: m.HomeFeatureVideo,
  })),
);

const HomePromoCard = dynamic(() =>
  import("@/features/home/components/home-promo-card").then((m) => ({
    default: m.HomePromoCard,
  })),
);

const HomeFlashSaleCountdownStrip = dynamic(() =>
  import("@/features/home/components/home-flash-sale-countdown").then((m) => ({
    default: m.HomeFlashSaleCountdownStrip,
  })),
);

const HomeMobileServicesCapsule = dynamic(() =>
  import("@/features/home/components/home-mobile-services-capsule").then((m) => ({
    default: m.HomeMobileServicesCapsule,
  })),
);

const HomeCustomProductSections = dynamic(() =>
  import("@/features/home/components/home-custom-product-sections").then((m) => ({
    default: m.HomeCustomProductSections,
  })),
);

const HomeParentCategorySections = dynamic(() =>
  import("@/features/home/components/home-parent-category-sections").then((m) => ({
    default: m.HomeParentCategorySections,
  })),
);

const HomeParentCategorySectionsSkeleton = dynamic(() =>
  import("@/features/home/components/home-parent-category-sections").then((m) => ({
    default: m.HomeParentCategorySectionsSkeleton,
  })),
);

const DEFAULT_BOTTOM_PROMO: HomeBottomPromo = {
  eyebrow: "حصرياً",
  title: "مجموعة تحضير القهوة",
  subtitle: "عروض لفترة محدودة على ماكينات القهوة والمطاحن — وفر حتى 40٪.",
  href: ROUTES.CATEGORY("coffee-maker"),
  ctaLabel: "اكتشف الآن",
};

function railSkeletonCount() {
  return Math.max(4, HOME_RAIL_PER_PAGE);
}

/**
 * الهوم التفاعلية (عميل)
 * بالعامية: جوّه `HomePageShell` من السيرفر؛ سكة منتجات واحدة تتحمّل فوراً، والباقي lazy لما القرب من الـ viewport (`useNearViewport`) علشان ما نضربش الـ API كله مرة واحدة.
 */
export function HomePageInteractiveClient({
  heroSlides = [],
  heroCategoryNamesBySlug,
  sectionBanners = [],
  flashSaleSectionEnabled = true,
  promoFlash,
  homeBottomPromo = DEFAULT_BOTTOM_PROMO,
  homeBottomPromoVisible = true,
  homeFeatureVideo,
  homeProductSectionsMode = "auto",
  homeProductSections = [],
}: HomePageContentProps) {
  const router = useTransitionRouter();
  const flashSales = useProducts(HOME_FLASH_SALE_PRODUCT_PARAMS, {
    enabled: flashSaleSectionEnabled,
  });

  const bestViewport = useNearViewport({
    initialNear: !flashSaleSectionEnabled,
  });
  const homeBestsellers = useProducts(HOME_BESTSELLERS_PRODUCT_PARAMS, {
    enabled: !flashSaleSectionEnabled || bestViewport.near,
  });

  const newViewport = useNearViewport();
  const newArrivals = useProducts(HOME_NEW_ARRIVALS_PRODUCT_PARAMS, {
    enabled: newViewport.near,
  });

  const categories = useCategories(HOME_CATEGORIES_QUERY_PARAMS);
  const { getCartLineQuantity, setProductLineQuantity } = useCart();
  const { offline } = useNetworkStatus();

  const renderFeatureVideo = (placement: CmsHomeFeatureVideo["placement"]) =>
    homeFeatureVideo?.enabled && homeFeatureVideo.placement === placement ? (
      <ScrollReveal>
        <HomeFeatureVideo video={homeFeatureVideo} />
      </ScrollReveal>
    ) : null;

  const promoPlacement =
    homeBottomPromo.homePlacement ?? CMS_DEFAULT_HOME_SPOTLIGHT_PLACEMENT;
  const promoImagePriority = heroSlides.length === 0;
  const renderHomePromo = (slot: CmsHomeSpotlightPlacement) =>
    homeBottomPromoVisible && promoPlacement === slot ? (
      <ScrollReveal>
        <HomePromoCard
          eyebrow={homeBottomPromo.eyebrow}
          title={homeBottomPromo.title}
          subtitle={homeBottomPromo.subtitle}
          href={homeBottomPromo.href}
          ctaLabel={homeBottomPromo.ctaLabel}
          imageSrc={homeBottomPromo.imageSrc}
          imagePriority={promoImagePriority}
        />
      </ScrollReveal>
    ) : null;

  const eagerPrioritySlots = 2;

  const homeGridShared = {
    simpleImageMode: true as const,
    imageMotion: false as const,
    imageInteractions: false as const,
    getCartLineQuantity,
    onCartLineQuantityChange: setProductLineQuantity,
    cardVariant: "mobileCompact" as const,
    cardVariantMd: "desktopCatalogWide" as const,
    gridClassName:
      "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5",
  };

  return (
    <>
      {renderFeatureVideo("top")}
      {renderHomePromo("top")}
      {heroSlides.length > 0 ? (
        <HomeHeroLayout
          slides={heroSlides}
          categoryNamesBySlug={heroCategoryNamesBySlug}
        />
      ) : null}
      {renderFeatureVideo("afterHero")}
      {renderHomePromo("afterHero")}

      <ScrollReveal>
        <HomeCategoryDiscovery categories={categories.data ?? []} />
      </ScrollReveal>

      {!flashSaleSectionEnabled
        ? null
        : (() => {
            const flashItems = flashSales.data?.items ?? [];
            const flashFatal = flashSales.isError && !flashItems.length;
            if (flashFatal) {
              return (
                <ScrollReveal>
                  <ErrorState
                    message={flashSales.error.message}
                    onRetry={() => void flashSales.refetch()}
                  />
                </ScrollReveal>
              );
            }
            if (
              !flashSales.isPending &&
              !flashItems.length &&
              !flashSales.isError
            ) {
              return null;
            }
            const flashStale =
              (flashSales.data?.responseSource === "cache-fallback" &&
                flashItems.length > 0) ||
              (offline && flashItems.length > 0) ||
              (flashSales.isError && flashItems.length > 0);
            const flashStaleVariant =
              offline && flashItems.length > 0 ? "offline-cache" : "api-fallback";
            return (
              <ScrollReveal className="space-y-4">
                <HomeFlashSaleCountdownStrip
                  className="w-full"
                  endsAtIso={promoFlash?.endsAtIso}
                  headline={promoFlash?.headline}
                  subline={promoFlash?.subline}
                />
                <HomeResponsiveProductSection
                  staleNotice={
                    flashStale ? (
                      <StorefrontStaleDataNotice variant={flashStaleVariant} />
                    ) : null
                  }
                  header={{
                    id: "home-flash-sales-title",
                    title: "عروض الشهر",
                    subtitle: "خصومات محدودة على مختارات سوكاني",
                    viewAllHref: ROUTES.OFFERS,
                  }}
                  grid={{
                    ...homeGridShared,
                    status:
                      flashSales.isPending
                        ? "loading"
                        : !flashItems.length
                          ? "empty"
                          : "ready",
                    products: flashItems,
                    skeletonCount: railSkeletonCount(),
                    priorityImageSlots: eagerPrioritySlots,
                    empty: (
                      <EmptyState
                        title="لا توجد عروض نشطة حالياً"
                        description="تصفح المنتجات للمزيد."
                        action={
                          <Button
                            type="button"
                            onClick={() => router.push(ROUTES.PRODUCTS)}
                          >
                            المنتجات
                          </Button>
                        }
                      />
                    ),
                  }}
                  rail={{
                    status: "ready",
                    "aria-label": "عروض الشهر",
                    skeletonCount: railSkeletonCount(),
                  }}
                />
              </ScrollReveal>
            );
          })()}
      {renderFeatureVideo("afterFlashSales")}
      {renderHomePromo("afterFlashSales")}

      <ScrollReveal>
        <HomeMobileServicesCapsule />
      </ScrollReveal>
      {renderFeatureVideo("afterServices")}
      {renderHomePromo("afterServices")}

      {renderFeatureVideo("afterPromo")}

      <ScrollReveal>
        <div ref={bestViewport.ref}>
          {!flashSaleSectionEnabled || bestViewport.near ? (
            (() => {
              const bestItems = homeBestsellers.data?.items ?? [];
              const bestFatal = homeBestsellers.isError && !bestItems.length;
              if (bestFatal) {
                return (
                  <ErrorState
                    message={homeBestsellers.error.message}
                    onRetry={() => void homeBestsellers.refetch()}
                  />
                );
              }
              const bestStale =
                (homeBestsellers.data?.responseSource === "cache-fallback" &&
                  bestItems.length > 0) ||
                (offline && bestItems.length > 0) ||
                (homeBestsellers.isError && bestItems.length > 0);
              const bestStaleVariant =
                offline && bestItems.length > 0
                  ? "offline-cache"
                  : "api-fallback";
              const bestEager = !flashSaleSectionEnabled;
              return (
                <HomeResponsiveProductSection
                  staleNotice={
                    bestStale ? (
                      <StorefrontStaleDataNotice variant={bestStaleVariant} />
                    ) : null
                  }
                  header={{
                    id: "home-bestsellers-title",
                    title: "الأكثر مبيعاً",
                    viewAllHref: `${ROUTES.PRODUCTS}?orderby=popularity&order=desc`,
                  }}
                  grid={{
                    ...homeGridShared,
                    status:
                      homeBestsellers.isPending
                        ? "loading"
                        : !bestItems.length
                          ? "empty"
                          : "ready",
                    products: bestItems,
                    skeletonCount: railSkeletonCount(),
                    priorityImageSlots: bestEager ? eagerPrioritySlots : 0,
                    empty: (
                      <EmptyState
                        title="لا توجد منتجات لعرضها في هذا القسم حالياً"
                        description="تصفح الكتالوج الكامل."
                        action={
                          <Button
                            type="button"
                            onClick={() => router.push(ROUTES.PRODUCTS)}
                          >
                            المنتجات
                          </Button>
                        }
                      />
                    ),
                  }}
                  rail={{
                    status: "ready",
                    "aria-label": "الأكثر مبيعاً",
                    skeletonCount: railSkeletonCount(),
                  }}
                />
              );
            })()
          ) : (
            <HomeProductRailPlaceholder aria-label="قسم الأكثر مبيعاً" />
          )}
        </div>
      </ScrollReveal>
      {renderHomePromo("afterBestsellers")}

      {(() => {
        const newItems = newArrivals.data?.items ?? [];
        const doneEmpty =
          newViewport.near &&
          newArrivals.isSuccess &&
          !newItems.length &&
          !newArrivals.isError;
        if (doneEmpty) return null;

        const newFatal = newArrivals.isError && !newItems.length;
        if (newViewport.near && newFatal) {
          return (
            <ScrollReveal>
              <ErrorState
                message={newArrivals.error.message}
                onRetry={() => void newArrivals.refetch()}
              />
            </ScrollReveal>
          );
        }

        const newStale =
          (newArrivals.data?.responseSource === "cache-fallback" &&
            newItems.length > 0) ||
          (offline && newItems.length > 0) ||
          (newArrivals.isError && newItems.length > 0);
        const newStaleVariant =
          offline && newItems.length > 0 ? "offline-cache" : "api-fallback";

        return (
          <ScrollReveal>
            <div ref={newViewport.ref}>
              {!newViewport.near ? (
                <HomeProductRailPlaceholder aria-label="قسم وصل حديثاً" />
              ) : (
                <HomeResponsiveProductSection
                  staleNotice={
                    newStale ? (
                      <StorefrontStaleDataNotice variant={newStaleVariant} />
                    ) : null
                  }
                  header={{
                    id: "home-new-arrivals-title",
                    title: "وصل حديثاً",
                    subtitle: "أحدث الإضافات إلى كتالوج سوكاني",
                    viewAllHref: `${ROUTES.PRODUCTS}?orderby=date&order=desc`,
                  }}
                  grid={{
                    ...homeGridShared,
                    status:
                      newArrivals.isPending
                        ? "loading"
                        : !newItems.length
                          ? "empty"
                          : "ready",
                    products: newItems,
                    skeletonCount: railSkeletonCount(),
                    priorityImageSlots: 0,
                    empty: (
                      <EmptyState
                        title="لا توجد منتجات جديدة حالياً"
                        description="تصفح الكتالوج الكامل."
                        action={
                          <Button
                            type="button"
                            onClick={() => router.push(ROUTES.PRODUCTS)}
                          >
                            المنتجات
                          </Button>
                        }
                      />
                    ),
                  }}
                  rail={{
                    status: "ready",
                    "aria-label": "وصل حديثاً",
                    skeletonCount: railSkeletonCount(),
                  }}
                />
              )}
            </div>
          </ScrollReveal>
        );
      })()}
      {renderHomePromo("afterNewArrivals")}

      <ScrollReveal>
        <HomeBrandSupportGrid />
      </ScrollReveal>

      {homeProductSectionsMode === "custom" ||
      homeProductSectionsMode === "hybrid" ? (
        <HomeCustomProductSections
          sections={homeProductSections}
          categories={categories.data ?? []}
          getCartLineQuantity={getCartLineQuantity}
          onCartLineQuantityChange={setProductLineQuantity}
        />
      ) : null}

      {homeProductSectionsMode === "auto" || homeProductSectionsMode === "hybrid" ? (
        categories.isError && !categories.data?.length ? (
          <ScrollReveal>
            <ErrorState
              message={categories.error.message}
              onRetry={() => void categories.refetch()}
            />
          </ScrollReveal>
        ) : categories.data && categories.data.length > 0 ? (
          <HomeParentCategorySections
            categories={categories.data}
            sectionBanners={sectionBanners}
            getCartLineQuantity={getCartLineQuantity}
            onCartLineQuantityChange={setProductLineQuantity}
          />
        ) : categories.isPending ? (
          <ScrollReveal>
            <HomeParentCategorySectionsSkeleton sections={2} />
          </ScrollReveal>
        ) : null
      ) : null}
    </>
  );
}
