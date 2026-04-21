"use client";

import { useTransitionRouter } from "next-view-transitions";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
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
import { HomeTrustStrip } from "@/features/home/components/home-trust-strip";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ROUTES } from "@/lib/constants";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { HomeCategoryImageScroller } from "@/features/home/components/home-category-image-scroller";
import { HomeFlashSaleCountdownStrip } from "@/features/home/components/home-flash-sale-countdown";
import { useProducts } from "@/features/products/hooks/useProducts";

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M3 11a9 9 0 0118 0v1a3 3 0 003 3" strokeLinecap="round" />
      <path d="M21 15v3a2 2 0 01-2 2h-1v-6M3 15v3a2 2 0 002 2h1v-6" strokeLinecap="round" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M10 17h4V5H2v12h3m8 0h2M6 17v-3M18 9h3l3 3v5h-3M2 17h2" strokeLinecap="round" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

function CheckSealIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 3l7 4v5c0 5-3 9-7 11-4-2-7-6-7-11V7l7-4z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/*
 * الصفحة الرئيسية (/): عمود واحد داخل Container بمسافات رأسية تتسع تدريجياً (sm → md).
 * التسلسل: هيرو (سكروول أفقي + auto-rotate) → شريط صور التصنيفات
 * (240×120 سكروول أفقي؛ سيليكتون أثناء تحميل التصنيفات من الـ API) → عروض سريعة (بانر أزرق + عداد + CTA ثم شبكة on_sale) → شريط ثقة
 * → الأكثر مبيعاً (featured) → وصل حديثاً (orderby تاريخ) → أقسام الأب للتصنيفات
 * (هيكل تحميل حتى تُحمَّل قائمة التصنيفات ثم المحتوى الفعلي) → بطاقة ترويجي في الأسفل.
 */
export type HomeBottomPromo = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  href: string;
  ctaLabel: string;
  imageSrc?: string;
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
  /** بطاقة الترويج أسفل الصفحة — افتراضي ثابت أو من spotlight في Firestore. */
  homeBottomPromo?: HomeBottomPromo;
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
}: HomePageContentProps) {
  const router = useTransitionRouter();
  const featured = useProducts({ featured: true, per_page: 8 });
  const flashSales = useProducts({
    on_sale: true,
    per_page: 8,
    orderby: "date",
    order: "desc",
  });
  const newArrivals = useProducts({
    per_page: 8,
    orderby: "date",
    order: "desc",
  });
  const categories = useCategories({ per_page: 100 });
  const { getCartLineQuantity, setProductLineQuantity } = useCart();
  const categoryTiles = (categories.data ?? []).map((category) => ({
    imageSrc: category.image ?? "/images/placeholder.png",
    imageAlt: category.name,
    href: ROUTES.CATEGORY(category.slug),
  }));

  return (
    <div className="animate-fade-in bg-page">
      <Container className="space-y-5 pb-8  sm:space-y-6 sm:pb-10">
        {/* أعلى الصفحة: شرائح هيرو ديناميكية تُقرأ من /public/images/hero */}
        {heroSlides.length > 0 ? <HomeHeroBanner slides={heroSlides} /> : null}

        {/* تحت البانر مباشرة: شريط صور ديناميكي من التصنيفات المتاحة في API */}
        <HomeCategoryImageScroller
          tiles={categoryTiles}
          isLoading={categories.isPending}
        />

        {/* عروض سريعة: منتجات مخفّضة من WooCommerce + عداد تنازلي */}
        {!flashSaleSectionEnabled ? null : flashSales.isError ? (
          <ErrorState
            message={flashSales.error.message}
            onRetry={() => void flashSales.refetch()}
          />
        ) : flashSales.isPending || (flashSales.data?.length ?? 0) > 0 ? (
          <section className="space-y-4" aria-labelledby="home-flash-sales-title">
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
                  : !flashSales.data?.length
                    ? "empty"
                    : "ready"
              }
              products={flashSales.data ?? []}
              getCartLineQuantity={getCartLineQuantity}
              onCartLineQuantityChange={setProductLineQuantity}
              cardVariant="mobileCompact"
              cardVariantMd="desktopCatalogWide"
              gridClassName="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
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
          </section>
        ) : null}

        {/* من lg: صف واحد (٤ أعمدة)؛ من md حتى lg: شبكة ٢×٢؛ مخفية على الجوال */}
        <HomeTrustStrip
          className="hidden md:grid"
          items={[
            {
              label: "شحن محلي",
              description: "شحن مجاني للطلبات فوق ٢٠٠٠ جنية",
              icon: <ShieldIcon />,
            },
            {
              label: "تقسيط مريح",
              description: "اقساط مريحه تصل الي ٢٤ شهرا.",
              icon: <ShieldIcon />,
            },
            {
              label: "عروض جديدة",
              description: "مرتبطة بصفحة العروض.",
              icon: <HeadsetIcon />,
            },
            {
              label: "ارجاع خلال ١٤ يوما",
              description: "استرداد المشتريات خلال ١٤ يوما.",
              icon: <TruckIcon />,
            },
          ]}
        />

        {/* الجوال فقط: نسخة مختصرة من شريط الثقة؛ تختفي من md */}
        <HomeTrustStrip
          className="grid md:hidden"
          items={[
            {
              label: "شحن محلي",
              description: "شحن مجاني للطلبات فوق ٢٠٠٠ جنية",
              icon: <ShieldIcon />,
            },
            {
              label: "ارجاع خلال ١٤ يوما",
              description: "استرداد المشتريات خلال ١٤ يوما.",
              icon: <TruckIcon />,
            },
          ]}
        />

        {/* قسم الأكثر مبيعاً: عنوان وسطي + شبكة منتجات (٢ / ٣ / ٤ أعمدة حسب الشاشة) */}
        <section className="space-y-4" aria-labelledby="home-bestsellers-title">
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

          {featured.isError ? (
            <ErrorState message={featured.error.message} onRetry={() => void featured.refetch()} />
          ) : (
            <ProductGrid
              status={
                featured.isPending
                  ? "loading"
                  : !featured.data?.length
                    ? "empty"
                    : "ready"
              }
              products={featured.data ?? []}
              getCartLineQuantity={getCartLineQuantity}
              onCartLineQuantityChange={setProductLineQuantity}
              cardVariant="mobileCompact"
              cardVariantMd="desktopCatalogWide"
              gridClassName="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
              empty={
                <EmptyState
                  title="لا توجد منتجات مميزة حالياً"
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
        </section>

        {/* وصل حديثاً: أحدث المنتجات حسب التاريخ */}
        {newArrivals.isError ? (
          <ErrorState
            message={newArrivals.error.message}
            onRetry={() => void newArrivals.refetch()}
          />
        ) : newArrivals.isPending || (newArrivals.data?.length ?? 0) > 0 ? (
          <section className="space-y-4" aria-labelledby="home-new-arrivals-title">
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
                  : !newArrivals.data?.length
                    ? "empty"
                    : "ready"
              }
              products={newArrivals.data ?? []}
              getCartLineQuantity={getCartLineQuantity}
              onCartLineQuantityChange={setProductLineQuantity}
              cardVariant="mobileCompact"
              cardVariantMd="desktopCatalogWide"
              gridClassName="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
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
          </section>
        ) : null}

        {/* أقسام رأسية لكل تصنيف أب: شبكات/سكك داخل نفس العمود عند توفر التصنيفات */}
        {categories.isPending ? (
          <HomeParentCategorySectionsSkeleton
            getCartLineQuantity={getCartLineQuantity}
            onCartLineQuantityChange={setProductLineQuantity}
          />
        ) : categories.data && categories.data.length > 0 ? (
          <HomeParentCategorySections
            categories={categories.data}
            sectionBanners={sectionBanners}
            getCartLineQuantity={getCartLineQuantity}
            onCartLineQuantityChange={setProductLineQuantity}
          />
        ) : null}

        {/* أسفل الصفحة: بطاقة ترويج كاملة العرض داخل الحاوية */}
        <HomePromoCard
          eyebrow={homeBottomPromo.eyebrow}
          title={homeBottomPromo.title}
          subtitle={homeBottomPromo.subtitle}
          href={homeBottomPromo.href}
          ctaLabel={homeBottomPromo.ctaLabel}
          imageSrc={homeBottomPromo.imageSrc}
        />
      </Container>
    </div>
  );
}
