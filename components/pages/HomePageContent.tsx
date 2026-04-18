"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { useCart } from "@/hooks/useCart";
import {
  HomeHeroBanner,
  type HomeHeroSlide,
} from "@/features/home/components/home-hero-banner";
import { HomeParentCategorySections } from "@/features/home/components/home-parent-category-sections";
import { HomePromoCard } from "@/features/home/components/home-promo-card";
import { ProductHorizontalRail } from "@/features/home/components/product-horizontal-rail";
import { HomeTrustStrip } from "@/features/home/components/home-trust-strip";
import { ROUTES } from "@/lib/constants";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { HomeCategoryImageScroller } from "@/features/home/components/home-category-image-scroller";
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
 * التسلسل: هيرو (330×540 سكروول أفقي + auto-rotate) → شريط صور التصنيفات
 * (240×120 سكروول أفقي + auto-rotate، بيانات ديناميكية من /api/categories)
 * → شريط ثقة (نسختان حسب md) → الأكثر مبيعاً (سكة أفقية) → أقسام الأب للتصنيفات
 * (لكل أب بالترتيب: بانر «حصرياً» من `/images/banner-section/01.*`, `02.*`, … وإلا صورة القسم/المنتج)
 * → بطاقة عرض ترويجي في الأسفل.
 */
export type HomePageContentProps = {
  /** Hero slides resolved on the server from `public/images/hero/`. */
  heroSlides?: HomeHeroSlide[];
  /** Ordered banner URLs from `public/images/banner-section/` (`01.*`, `02.*`, …) for «حصرياً». */
  sectionBannerImages?: string[];
};

export function HomePageContent({
  heroSlides = [],
  sectionBannerImages = [],
}: HomePageContentProps) {
  const router = useRouter();
  const featured = useProducts({ featured: true, per_page: 8 });
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
        <HomeCategoryImageScroller tiles={categoryTiles} />

        {/* من md فما فوق: ثلاثية ثقة بعرض الشبكة؛ مخفية على الجوال */}
        <HomeTrustStrip
          className="hidden md:grid"
          items={[
            {
              label: "ضمان حقيقي عامين",
              description: "تسوق بثقة مع ضمان معتمد على الأجهزة المختارة.",
              icon: <ShieldIcon />,
            },
            {
              label: "خدمة ما بعد البيع",
              description: "دعم فني ومراكز خدمة متاحة عند الحاجة.",
              icon: <HeadsetIcon />,
            },
            {
              label: "توصيل آمن وسريع",
              description: "شحن موثوق لأنحاء مصر.",
              icon: <TruckIcon />,
            },
          ]}
        />

        {/* الجوال فقط: نسخة مختصرة من شريط الثقة؛ تختفي من md */}
        <HomeTrustStrip
          className="grid md:hidden"
          items={[
            { label: "ضمان معتمد", icon: <ShieldIcon /> },
            { label: "منتجات أصلية", icon: <CheckSealIcon /> },
          ]}
        />

        {/* قسم الأكثر مبيعاً: عنوان وسطي + سكة منتجات أفقية داخل نفس العمود */}
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
            <ProductHorizontalRail
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
              aria-label="الأكثر مبيعاً"
              className="-mx-4 sm:mx-0"
            />
          )}
        </section>

        {/* أقسام رأسية لكل تصنيف أب: شبكات/سكك داخل نفس العمود عند توفر التصنيفات */}
        {categories.data && categories.data.length > 0 ? (
          <HomeParentCategorySections
            categories={categories.data}
            sectionBannerImages={sectionBannerImages}
            getCartLineQuantity={getCartLineQuantity}
            onCartLineQuantityChange={setProductLineQuantity}
          />
        ) : null}

        {/* أسفل الصفحة: بطاقة ترويج كاملة العرض داخل الحاوية */}
        <HomePromoCard
          eyebrow="حصرياً"
          title="مجموعة تحضير القهوة"
          subtitle="عروض لفترة محدودة على ماكينات القهوة والمطاحن — وفر حتى 40٪."
          href={ROUTES.CATEGORY("coffee-maker")}
          ctaLabel="اكتشف الآن"
        />
      </Container>
    </div>
  );
}
