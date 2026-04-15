"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { SearchField } from "@/components/ui/search-field";
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
  const [searchDraft, setSearchDraft] = useState("");
  const featured = useProducts({ featured: true, per_page: 8 });
  const categories = useCategories();
  const { addProduct } = useCart();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchDraft.trim();
    if (!q) {
      router.push(ROUTES.PRODUCTS);
      return;
    }
    router.push(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(q)}`);
  };

  return (
    <div className="animate-fade-in bg-page">
      <Container className="space-y-5 pb-8 pt-3 sm:space-y-6 sm:pb-10">
        <form onSubmit={submitSearch} className="w-full">
          <SearchField
            className="h-12 rounded-full border-0 bg-white pe-1 shadow-[0_6px_22px_-10px_rgba(15,23,42,0.12)] ring-1 ring-black/[0.05] focus-within:ring-2 focus-within:ring-brand-500/40"
            inputClassName="py-2.5 text-[15px] placeholder:text-muted-foreground/75"
            placeholder="ابحث عن منتجات سوكانى…"
            value={searchDraft}
            onChange={(ev) => setSearchDraft(ev.target.value)}
            aria-label="بحث في المنتجات"
            leading={
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3-3" strokeLinecap="round" />
              </svg>
            }
            trailing={
              <button
                type="submit"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-page text-black transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                aria-label="تنفيذ البحث"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3-3" strokeLinecap="round" />
                </svg>
              </button>
            }
          />
        </form>

        {categories.data && categories.data.length > 0 ? (
          <CategoryShortcutGrid categories={categories.data} layout="home" limit={6} />
        ) : null}

        <HomeHeroBanner
          compact
          title="مطبخك يستحق الأفضل"
          subtitle="أدوات مطبخ أصلية بضمان الوكيل، وتوصيل موثوق لكل مصر."
          primaryHref={ROUTES.PRODUCTS}
          primaryLabel="تسوق الآن"
        />

        <HomeTrustStrip
          items={[
            { label: "منتجات أصلية", icon: <ShieldIcon /> },
            { label: "شحن موثوق", icon: <TruckIcon /> },
          ]}
        />

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold tracking-tight text-black sm:text-xl">الأكثر مبيعاً</h2>
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
