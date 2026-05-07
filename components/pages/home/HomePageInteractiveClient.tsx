"use client";

import { useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { useTransitionRouter } from "next-view-transitions";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { useCart } from "@/hooks/useCart";
import {
  HomeHeroBanner,
} from "@/features/home/components/home-hero-banner";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ROUTES } from "@/lib/constants";
import { useCategories } from "@/features/categories/hooks/useCategories";
import {
  HOME_BESTSELLERS_PRODUCT_PARAMS,
  HOME_CATEGORIES_QUERY_PARAMS,
  HOME_FLASH_SALE_PRODUCT_PARAMS,
  HOME_NEW_ARRIVALS_PRODUCT_PARAMS,
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

/** Helpers لـ ‎`useSyncExternalStore`‎: ثابتة على مستوى الـ module حتى لا تُنشأ في كل render. */
const subscribeNoop = () => () => undefined;
const getSnapshotClient = () => true;
const getSnapshotServer = () => false;

const DEFAULT_BOTTOM_PROMO: HomeBottomPromo = {
  eyebrow: "حصرياً",
  title: "مجموعة تحضير القهوة",
  subtitle: "عروض لفترة محدودة على ماكينات القهوة والمطاحن — وفر حتى 40٪.",
  href: ROUTES.CATEGORY("coffee-maker"),
  ctaLabel: "اكتشف الآن",
};

/**
 * جزء التفاعل والاستعلامات للصفحة الرئيسية — يُحمَّل كوحدة عميل داخل ‎`HomePageShell`‎ (خادم).
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
  const flashSales = useProducts(HOME_FLASH_SALE_PRODUCT_PARAMS);
  const newArrivals = useProducts(HOME_NEW_ARRIVALS_PRODUCT_PARAMS);
  const categories = useCategories(HOME_CATEGORIES_QUERY_PARAMS);
  const homeBestsellers = useProducts(HOME_BESTSELLERS_PRODUCT_PARAMS);
  const { getCartLineQuantity, setProductLineQuantity } = useCart();
  const hasMounted = useSyncExternalStore(
    subscribeNoop,
    getSnapshotClient,
    getSnapshotServer,
  );
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

      {!flashSaleSectionEnabled ? null : flashSales.isError ? (
        <ScrollReveal>
          <ErrorState
            message={flashSales.error.message}
            onRetry={() => void flashSales.refetch()}
          />
        </ScrollReveal>
      ) : flashSales.isPending || (flashSales.data?.items.length ?? 0) > 0 ? (
        <ScrollReveal
          as="section"
          className="space-y-4"
          aria-labelledby="home-flash-sales-title"
        >
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
                : !flashSales.data?.items.length
                  ? "empty"
                  : "ready"
            }
            products={flashSales.data?.items ?? []}
            skeletonCount={12}
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
                title="لا توجد عروض نشطة حالياً"
                description="تصفح المنتجات للمزيد."
                action={
                  <Button type="button" onClick={() => router.push(ROUTES.PRODUCTS)}>
                    المنتجات
                  </Button>
                }
              />
            }
          />
        </ScrollReveal>
      ) : null}
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
        <div className="flex flex-col items-center gap-2 text-center">
          <h2
            id="home-bestsellers-title"
            className="text-base font-bold tracking-tight text-black sm:text-lg md:text-xl"
          >
            الأكثر مبيعاً
          </h2>
        </div>

        {homeBestsellers.isError ? (
          <ErrorState
            message={homeBestsellers.error.message}
            onRetry={() => void homeBestsellers.refetch()}
          />
        ) : (
          <ProductGrid
            status={
              homeBestsellers.isPending
                ? "loading"
                : !homeBestsellers.data?.items.length
                  ? "empty"
                  : "ready"
            }
            products={homeBestsellers.data?.items ?? []}
            skeletonCount={12}
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
                title="لا توجد منتجات لعرضها في هذا القسم حالياً"
                description="تصفح الكتالوج الكامل."
                action={
                  <Button type="button" onClick={() => router.push(ROUTES.PRODUCTS)}>
                    المنتجات
                  </Button>
                }
              />
            }
          />
        )}
      </ScrollReveal>
      {renderHomePromo("afterBestsellers")}

      {newArrivals.isError ? (
        <ScrollReveal>
          <ErrorState
            message={newArrivals.error.message}
            onRetry={() => void newArrivals.refetch()}
          />
        </ScrollReveal>
      ) : newArrivals.isPending || (newArrivals.data?.items.length ?? 0) > 0 ? (
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
          <ProductGrid
            status={
              newArrivals.isPending
                ? "loading"
                : !newArrivals.data?.items.length
                  ? "empty"
                  : "ready"
            }
            products={newArrivals.data?.items ?? []}
            skeletonCount={12}
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
                  <Button type="button" onClick={() => router.push(ROUTES.PRODUCTS)}>
                    المنتجات
                  </Button>
                }
              />
            }
          />
        </ScrollReveal>
      ) : null}
      {renderHomePromo("afterNewArrivals")}

      {homeProductSectionsMode === "custom" || homeProductSectionsMode === "hybrid" ? (
        <HomeCustomProductSections
          sections={homeProductSections}
          categories={categories.data ?? []}
          getCartLineQuantity={getCartLineQuantity}
          onCartLineQuantityChange={setProductLineQuantity}
        />
      ) : null}

      {homeProductSectionsMode === "auto" || homeProductSectionsMode === "hybrid" ? (
        !hasMounted ? (
          <ScrollReveal>
            <HomeParentCategorySectionsSkeleton
              getCartLineQuantity={getCartLineQuantity}
              onCartLineQuantityChange={setProductLineQuantity}
            />
          </ScrollReveal>
        ) : categories.isError ? (
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
            <HomeParentCategorySectionsSkeleton
              getCartLineQuantity={getCartLineQuantity}
              onCartLineQuantityChange={setProductLineQuantity}
            />
          </ScrollReveal>
        ) : null
      ) : null}
    </>
  );
}
