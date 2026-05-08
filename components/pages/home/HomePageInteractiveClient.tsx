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
import { HomeHeroBanner } from "@/features/home/components/home-hero-banner";
import { HomeProductRailPlaceholder } from "@/features/home/components/home-product-rail-placeholder";
import { ProductGrid } from "@/features/products/components/ProductGrid";
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
 * جزء التفاعل والاستعلامات للصفحة الرئيسية — يُحمَّل كوحدة عميل داخل ‎`HomePageShell`‎ (خادم).
 * سكة منتجات واحدة فقط تُحمَّل فوراً؛ الباقي يُفعَّل عند اقتراب القسم من الشاشة (‎`useNearViewport`‎) بدون ‎`ProductGrid`‎ قبل ذلك.
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

  return (
    <>
      {renderFeatureVideo("top")}
      {renderHomePromo("top")}
      {heroSlides.length > 0 ? (
        <HomeHeroBanner
          slides={heroSlides}
          categoryNamesBySlug={heroCategoryNamesBySlug}
        />
      ) : null}
      {renderFeatureVideo("afterHero")}
      {renderHomePromo("afterHero")}

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
              <ScrollReveal
                as="section"
                className="space-y-4"
                aria-labelledby="home-flash-sales-title"
              >
                {flashStale ? (
                  <StorefrontStaleDataNotice variant={flashStaleVariant} />
                ) : null}
                <HomeFlashSaleCountdownStrip
                  className="w-full"
                  endsAtIso={promoFlash?.endsAtIso}
                  headline={promoFlash?.headline}
                  subline={promoFlash?.subline}
                />
                <ProductGrid
                  status={
                    flashSales.isPending
                      ? "loading"
                      : !flashItems.length
                        ? "empty"
                        : "ready"
                  }
                  products={flashItems}
                  skeletonCount={railSkeletonCount()}
                  priorityImageSlots={eagerPrioritySlots}
                  simpleImageMode
                  imageMotion={false}
                  imageInteractions={false}
                  getCartLineQuantity={getCartLineQuantity}
                  onCartLineQuantityChange={setProductLineQuantity}
                  cardVariant="mobileCompact"
                  cardVariantMd="desktopCatalogWide"
                  gridClassName="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5"
                  empty={
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
                  }
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

      <ScrollReveal
        as="section"
        className="space-y-4"
        aria-labelledby="home-bestsellers-title"
      >
        <div ref={bestViewport.ref} className="space-y-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <h2
              id="home-bestsellers-title"
              className="text-base font-bold tracking-tight text-black sm:text-lg md:text-xl"
            >
              الأكثر مبيعاً
            </h2>
          </div>

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
                <>
                  {bestStale ? (
                    <StorefrontStaleDataNotice variant={bestStaleVariant} />
                  ) : null}
                  <ProductGrid
                    status={
                      homeBestsellers.isPending
                        ? "loading"
                        : !bestItems.length
                          ? "empty"
                          : "ready"
                    }
                    products={bestItems}
                    skeletonCount={railSkeletonCount()}
                    priorityImageSlots={bestEager ? eagerPrioritySlots : 0}
                    simpleImageMode
                    imageMotion={false}
                    imageInteractions={false}
                    getCartLineQuantity={getCartLineQuantity}
                    onCartLineQuantityChange={setProductLineQuantity}
                    cardVariant="mobileCompact"
                    cardVariantMd="desktopCatalogWide"
                    gridClassName="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5"
                    empty={
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
                    }
                  />
                </>
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
          <ScrollReveal
            as="section"
            className="space-y-4"
            aria-labelledby="home-new-arrivals-title"
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <h2
                id="home-new-arrivals-title"
                className="text-base font-bold tracking-tight text-black sm:text-lg md:text-xl"
              >
                وصل حديثاً
              </h2>
            </div>
            <div ref={newViewport.ref} className="space-y-4">
              {!newViewport.near ? (
                <HomeProductRailPlaceholder aria-label="قسم وصل حديثاً" />
              ) : (
                <>
                  {newStale ? (
                    <StorefrontStaleDataNotice variant={newStaleVariant} />
                  ) : null}
                  <ProductGrid
                    status={
                      newArrivals.isPending
                        ? "loading"
                        : !newItems.length
                          ? "empty"
                          : "ready"
                    }
                    products={newItems}
                    skeletonCount={railSkeletonCount()}
                    priorityImageSlots={0}
                    simpleImageMode
                    imageMotion={false}
                    imageInteractions={false}
                    getCartLineQuantity={getCartLineQuantity}
                    onCartLineQuantityChange={setProductLineQuantity}
                    cardVariant="mobileCompact"
                    cardVariantMd="desktopCatalogWide"
                    gridClassName="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5"
                    empty={
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
                    }
                  />
                </>
              )}
            </div>
          </ScrollReveal>
        );
      })()}
      {renderHomePromo("afterNewArrivals")}

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
