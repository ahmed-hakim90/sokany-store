"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { useCart } from "@/hooks/useCart";
import { HomeHeroBanner } from "@/features/home/components/home-hero-banner";
import { HomePromoCard } from "@/features/home/components/home-promo-card";
import { HomeTrustStrip } from "@/features/home/components/home-trust-strip";
import { ROUTES } from "@/lib/constants";
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

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M10 17h4V5H2v12h3m8 0h2M6 17v-3M18 9h3l3 3v5h-3M2 17h2" strokeLinecap="round" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
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
        {categories.data && categories.data.length > 0 ? (
          <CategoryShortcutGrid categories={categories.data} layout="home" limit={6} />
        ) : null}

        <HomeHeroBanner
          compact
          slides={[
            {
              title: "مطبخك يستحق الأفضل",
              subtitle:
                "أدوات مطبخ أصلية بضمان الوكيل، وتوصيل موثوق لكل مصر.",
              imageSrc: "/images/hero-banner.jpg",
              imageAlt: "",
              primaryHref: ROUTES.PRODUCTS,
              primaryLabel: "تسوق الآن",
              secondaryHref: ROUTES.CATEGORIES,
              secondaryLabel: "التصنيفات",
            },
            {
              title: "وكيل معتمد · شحن لكل مصر",
              subtitle: "تسوق بثقة مع ضمان أصلي ودعم ما بعد البيع.",
              imageSrc: "/images/hero-banner.jpg",
              imageAlt: "",
              primaryHref: ROUTES.PRODUCTS,
              primaryLabel: "اكتشف المنتجات",
            },
          ]}
        />

        <HomeTrustStrip
          items={[
            { label: "منتجات أصلية", icon: <ShieldIcon /> },
            { label: "شحن موثوق", icon: <TruckIcon /> },
          ]}
        />

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold tracking-tight text-black sm:text-lg md:text-xl">
              الأكثر مبيعاً
            </h2>
            <Link
              href={ROUTES.PRODUCTS}
              className="shrink-0 text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-black hover:underline sm:text-sm"
            >
              مشاهدة الكل
            </Link>
          </div>

          {featured.isError ? (
            <ErrorState message={featured.error.message} onRetry={() => void featured.refetch()} />
          ) : (
            <ProductGrid
              status={featured.isLoading ? "loading" : !featured.data?.length ? "empty" : "ready"}
              gridClassName="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-5"
              cardVariant="homeBestseller"
              cardVariantMd="desktopCatalog"
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
          title="عروض تجهيز المطبخ"
          subtitle="اختر ما يناسب مطبخك من تشكيلة سوكانى مع أسعار لفترة محدودة."
          href={ROUTES.PRODUCTS}
          ctaLabel="اكتشف العروض"
        />
      </Container>
    </div>
  );
}
