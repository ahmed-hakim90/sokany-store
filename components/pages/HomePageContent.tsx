"use client";

import { useSyncExternalStore } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { ScrollReveal } from "@/components/ScrollReveal";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { useCart } from "@/hooks/useCart";
import {
  HomeHeroBanner,
  type HomeHeroSlide,
} from "@/features/home/components/home-hero-banner";
import {
  HomeParentCategorySections,
  HomeParentCategorySectionsSkeleton,
} from "@/features/home/components/home-parent-category-sections";
import { HomePromoCard } from "@/features/home/components/home-promo-card";
import { HomeMobileServicesCapsule } from "@/features/home/components/home-mobile-services-capsule";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ROUTES } from "@/lib/constants";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { HomeFlashSaleCountdownStrip } from "@/features/home/components/home-flash-sale-countdown";
import { useProducts } from "@/features/products/hooks/useProducts";
import {
  CMS_DEFAULT_HOME_SPOTLIGHT_PLACEMENT,
  type CmsHomeCategoryScroller,
  type CmsHomeFeatureVideo,
  type CmsHomeProductSection,
  type CmsHomeProductSectionsMode,
  type CmsHomeSpotlightPlacement,
} from "@/schemas/cms";
import { HomeCustomProductSections } from "@/features/home/components/home-custom-product-sections";
import { HomeFeatureVideo } from "@/features/home/components/home-feature-video";

function subscribeHydrationSnapshot() {
  return () => {};
}

function getHydratedSnapshot() {
  return true;
}

function getServerHydrationSnapshot() {
  return false;
}

/*
 * الصفحة الرئيسية (/): عمود واحد داخل Container بمسافات رأسية تتسع تدريجياً (sm → md).
 * ‎`max-lg`‎: أثناء ‎`HomePageContent` بلا ‎`bg` تظهر ‎`MobileHeroLimeAtmosphere` (خلف ‎`main`‎) لوناً خلف
 * بانر الهيرو/الهوامس. التسلسل: هيرو → عروض سريعة → كبسولة خدمات → بطاقة ترويج (موضعها من CMS «إعلان مميز»)
 * → الأكثر مبيعاً → وصل حديثاً
 * → حسب ‎`homeProductSectionsMode`‎: ‎`auto`‎ أقسام أب فقط؛ ‎`custom`‎ أقسام CMS مخصصة فقط؛ ‎`hybrid`‎ المخصصة ثم الأب.
 * فشل جلب التصنيفات لأقسام الأب: ‎`ErrorState`‎. فشل منتجات قسم مخصص: ‎`ErrorState`‎ داخل ذلك القسم فقط.
 */
export type HomeBottomPromo = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  href: string;
  ctaLabel: string;
  imageSrc?: string;
  /** موضع بطاقة الترويج في عمود الهوم؛ الافتراضي بعد كبسولة الخدمات. */
  homePlacement?: CmsHomeSpotlightPlacement;
};

export type HomePageContentProps = {
  /** Hero من الملفات أو من Firestore. */
  heroSlides?: HomeHeroSlide[];
  /** بانرات أقسام الأب — ترتيب يطابق الفهرس. */
  sectionBanners?: { imageUrl: string; href?: string }[];
  /** إخفاء قسم «عروض سريعة» بالكامل (عداد + شبكة المنتجات المخفّضة). */
  flashSaleSectionEnabled?: boolean;
  /** إعدادات العداد والنصوص من لوحة التحكم. */
  promoFlash?: {
    endsAtIso?: string | null;
    headline?: string;
    subline?: string;
  };
  /** بطاقة الترويج بعد كبسولة الخدمات — افتراضي ثابت أو من spotlight في Firestore. */
  homeBottomPromo?: HomeBottomPromo;
  /**
   * سكroller صور التصنيفات تحت الهيرو — ‎`sectionVisible`‎ من ‎/control يتحكم في الإظهار.
   */
  homeCategoryScroller?: CmsHomeCategoryScroller;
  /** فيديو مميز من لوحة التحكم مع موضع قابل للتغيير. */
  homeFeatureVideo?: CmsHomeFeatureVideo;
  /** من ‎`site_config`‎ — الافتراضي ‎`auto`‎ عند الغياب. */
  homeProductSectionsMode?: CmsHomeProductSectionsMode;
  homeProductSections?: CmsHomeProductSection[];
};

const DEFAULT_BOTTOM_PROMO: HomeBottomPromo = {
  eyebrow: "حصرياً",
  title: "مجموعة تحضير القهوة",
  subtitle: "عروض لفترة محدودة على ماكينات القهوة والمطاحن — وفر حتى 40٪.",
  href: ROUTES.CATEGORY("coffee-maker"),
  ctaLabel: "اكتشف الآن",
};

export function HomePageContent({
  heroSlides = [],
  sectionBanners = [],
  flashSaleSectionEnabled = true,
  promoFlash,
  homeBottomPromo = DEFAULT_BOTTOM_PROMO,
  homeFeatureVideo,
  homeProductSectionsMode = "auto",
  homeProductSections = [],
}: HomePageContentProps) {
  const router = useTransitionRouter();
  const flashSales = useProducts({
    on_sale: true,
    per_page: 12,
    orderby: "date",
    order: "desc",
  });
  const newArrivals = useProducts({
    per_page: 12,
    orderby: "date",
    order: "desc",
  });
  const categories = useCategories({ per_page: 100 });
  const hasMounted = useSyncExternalStore(
    subscribeHydrationSnapshot,
    getHydratedSnapshot,
    getServerHydrationSnapshot,
  );
  const homeBestsellers = useProducts({
    per_page: 12,
    orderby: "popularity",
    order: "desc",
  });
  const { getCartLineQuantity, setProductLineQuantity } = useCart();
  const renderFeatureVideo = (placement: CmsHomeFeatureVideo["placement"]) =>
    homeFeatureVideo?.enabled && homeFeatureVideo.placement === placement ? (
      <ScrollReveal>
        <HomeFeatureVideo video={homeFeatureVideo} />
      </ScrollReveal>
    ) : null;

  const promoPlacement =
    homeBottomPromo.homePlacement ?? CMS_DEFAULT_HOME_SPOTLIGHT_PLACEMENT;
  const renderHomePromo = (slot: CmsHomeSpotlightPlacement) =>
    promoPlacement === slot ? (
      <ScrollReveal>
        <HomePromoCard
          eyebrow={homeBottomPromo.eyebrow}
          title={homeBottomPromo.title}
          subtitle={homeBottomPromo.subtitle}
          href={homeBottomPromo.href}
          ctaLabel={homeBottomPromo.ctaLabel}
          imageSrc={homeBottomPromo.imageSrc}
          /* Full-width 70dvh: often competes with narrow hero slides for LCP — eager avoids dev warning. */
          imagePriority
        />
      </ScrollReveal>
    ) : null;

  return (
    <div className="animate-fade-in bg-page max-lg:!bg-transparent">
      <Container className="space-y-5 pb-8  sm:space-y-6 sm:pb-10">
        <h1 className="sr-only">سوكاني المصرية - متجر أجهزة سوكاني في مصر</h1>
        {renderFeatureVideo("top")}
        {renderHomePromo("top")}
        {/* أعلى الصفحة: شرائح هيرو ديناميكية تُقرأ من /public/images/hero */}
        {heroSlides.length > 0 ? <HomeHeroBanner slides={heroSlides} /> : null}
        {renderFeatureVideo("afterHero")}
        {renderHomePromo("afterHero")}

        {/* {homeCategoryScroller.sectionVisible ? (
          <ScrollReveal>
            <HomeCategoryImageScroller
              tiles={categoryTiles}
              isLoading={categories.isPending}
            />
          </ScrollReveal>
        ) : null} */}

        {/* عروض سريعة: منتجات مخفّضة من WooCommerce + عداد تنازلي */}
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

        {/* كبسولة خدمات: أربع عناصر في سطر واحد — نفس الشكل على كل الشاشات */}
        <ScrollReveal>
          <HomeMobileServicesCapsule />
        </ScrollReveal>
        {renderFeatureVideo("afterServices")}
        {renderHomePromo("afterServices")}

        {/* بطاقة ترويج كاملة العرض — الموضع يُضبط من «إعلان مميز» في لوحة التحكم (افتراضياً بعد الخدمات). */}
        {renderFeatureVideo("afterPromo")}

        {/* قسم الأكثر مبيعاً: عنوان وسطي + شبكة منتجات (٢ / ٣ / ٤ أعمدة حسب الشاشة) */}
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
            {/* <Link
              href={ROUTES.PRODUCTS}
              className="text-xs font-semibold text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline sm:text-sm"
            >
              مشاهدة الكل
            </Link> */}
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

        {/* وصل حديثاً: أحدث المنتجات حسب التاريخ */}
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

        {/* أقسام منتجات الهوم: مخصصة (CMS) و/أو أقسام أب تلقائية حسب الوضع */}
        {homeProductSectionsMode === "custom" || homeProductSectionsMode === "hybrid" ? (
          <HomeCustomProductSections
            sections={homeProductSections}
            categories={hasMounted ? (categories.data ?? []) : []}
            getCartLineQuantity={getCartLineQuantity}
            onCartLineQuantityChange={setProductLineQuantity}
          />
        ) : null}

        {homeProductSectionsMode === "auto" || homeProductSectionsMode === "hybrid" ? (
          !hasMounted || categories.isPending ? (
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
          ) : null
        ) : null}
      </Container>
    </div>
  );
}
