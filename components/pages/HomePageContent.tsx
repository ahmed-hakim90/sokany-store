"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { useCart } from "@/hooks/useCart";
import { HomeCategoryBento } from "@/features/home/components/home-category-bento";
import { HomeHeroBanner } from "@/features/home/components/home-hero-banner";
import { HomePromoCard } from "@/features/home/components/home-promo-card";
import { HomeTrustStrip } from "@/features/home/components/home-trust-strip";
import { ROUTES, STORE_HERO_VIDEO_URL } from "@/lib/constants";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { CategoryShortcutGrid } from "@/features/categories/components/CategoryShortcutGrid";
import { useProducts } from "@/features/products/hooks/useProducts";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductSkeleton } from "@/features/products/components/ProductSkeleton";

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

export function HomePageContent() {
  const router = useRouter();
  const featured = useProducts({ featured: true, per_page: 8 });
  const categories = useCategories();
  const { addProduct } = useCart();

  return (
    <div className="animate-fade-in bg-page">
      <Container className="space-y-5 pb-8 pt-3 sm:space-y-6 sm:pb-10">
        <HomeHeroBanner
          compact
          slides={[
            {
              title: "جيل جديد من الأداء التقني",
              titleHighlight: "الأداء التقني",
              subtitle: "اكتشف مجموعة سوكاني الحصرية بأفضل الأسعار وضمان الوكيل.",
              imageSrc: "/images/hero-banner.jpg",
              imageAlt: "",
              primaryHref: ROUTES.PRODUCTS,
              primaryLabel: "تسوق الآن",
              secondaryHref: ROUTES.CATEGORIES,
              secondaryLabel: "شاهد التصنيفات",
            },
            {
              title: "فن الهندسة المنزلية",
              titleHighlight: "الهندسة",
              subtitle: "أدوات مطبخ وعناية شخصية أصلية، بتصميم عملي وتجربة تسوق واضحة.",
              imageSrc: "/images/hero-banner.jpg",
              imageAlt: "",
              primaryHref: ROUTES.PRODUCTS,
              primaryLabel: "استكشف المجموعة",
              secondaryHref: STORE_HERO_VIDEO_URL,
              secondaryLabel: "شاهد الفيديو",
              secondaryOpenInNewTab: true,
            },
          ]}
        />

        {categories.data && categories.data.length > 0 ? (
          <div className="md:hidden">
            <CategoryShortcutGrid categories={categories.data} layout="home" limit={6} />
          </div>
        ) : null}

        {categories.data && categories.data.length > 0 ? (
          <div className="hidden md:block">
            <HomeCategoryBento categories={categories.data} />
          </div>
        ) : null}

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

        <HomeTrustStrip
          className="grid md:hidden"
          items={[
            { label: "ضمان معتمد", icon: <ShieldIcon /> },
            { label: "منتجات أصلية", icon: <CheckSealIcon /> },
          ]}
        />

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold tracking-tight text-black sm:text-lg md:text-xl">
              الأكثر مبيعاً
            </h2>
            <Link
              href={ROUTES.PRODUCTS}
              className="shrink-0 text-xs font-semibold text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline sm:text-sm"
            >
              مشاهدة الكل
            </Link>
          </div>

          {featured.isError ? (
            <ErrorState message={featured.error.message} onRetry={() => void featured.refetch()} />
          ) : (
            <ProductGrid
              status={featured.isLoading ? "loading" : !featured.data?.length ? "empty" : "ready"}
              cardVariant="mobileCompact"
              cardVariantMd="desktopCatalogWide"
              gridClassName="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-5"
              loading={
                <>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))}
                </>
              }
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
              products={featured.data ?? []}
              onAddToCart={addProduct}
            />
          )}
        </section>

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
