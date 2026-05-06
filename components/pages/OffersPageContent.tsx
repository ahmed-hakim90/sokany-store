"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "next-view-transitions";
import { BadgePercent, Sparkles } from "lucide-react";
import { Container } from "@/components/Container";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CatalogPagination } from "@/features/catalog/components/CatalogPagination";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { DEFAULT_PER_PAGE, ROUTES } from "@/lib/constants";

function parsePage(value: string | null): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function OffersPageContent() {
  const searchParams = useSearchParams();
  const page = useMemo(() => parsePage(searchParams.get("page")), [searchParams]);
  const productsQuery = useProducts({
    on_sale: true,
    page,
    per_page: DEFAULT_PER_PAGE,
    orderby: "date",
    order: "desc",
  });
  const { getCartLineQuantity, setProductLineQuantity } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const getPageHref = useCallback((nextPage: number) => {
    if (nextPage <= 1) return ROUTES.OFFERS;
    return `${ROUTES.OFFERS}?page=${nextPage}`;
  }, []);

  const items = productsQuery.data?.items ?? [];
  const totalPages = productsQuery.data?.totalPages ?? 1;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-page">
      <Container className="pb-8 pt-3 sm:pb-10 sm:pt-4 lg:px-8">
        <ScrollReveal>
          <section className="relative isolate overflow-hidden rounded-[2rem] border border-white/70 bg-brand-950 px-5 py-7 text-white shadow-[0_24px_80px_-46px_rgba(15,23,42,0.55)] sm:px-8 sm:py-9">
            <div
              className="absolute inset-y-0 left-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(218,255,0,0.35),transparent_64%)] blur-2xl"
              aria-hidden
            />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-white/10 px-3 py-1 text-xs font-black text-accent backdrop-blur">
                  <BadgePercent className="h-4 w-4" aria-hidden />
                  خصومات سوكاني الحالية
                </div>
                <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
                  العروض
                </h1>
                <p className="mt-3 text-sm leading-7 text-white/72 sm:text-base">
                  هنا هتلاقي كل المنتجات اللي عليها خصم فعلي مرتبة من الأحدث للأقدم.
                </p>
              </div>
              <Link
                href={ROUTES.PRODUCTS}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/15"
              >
                كل المنتجات
              </Link>
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal className="mt-4 sm:mt-5">
          {productsQuery.isError ? (
            <ErrorState
              message={productsQuery.error.message}
              onRetry={() => void productsQuery.refetch()}
            />
          ) : (
            <section
              className="space-y-4"
              aria-labelledby="offers-products-title"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2
                    id="offers-products-title"
                    className="font-display text-lg font-black text-brand-950 sm:text-xl"
                  >
                    المنتجات المخفضة
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    الأسعار والخصومات تتحدث حسب بيانات المتجر.
                  </p>
                </div>
                {!productsQuery.isPending && items.length > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-950 shadow-sm ring-1 ring-border/70">
                    <Sparkles className="h-3.5 w-3.5 text-accent-foreground" aria-hidden />
                    {productsQuery.data?.total ?? items.length} عرض
                  </span>
                ) : null}
              </div>

              <ProductGrid
                status={
                  productsQuery.isPending
                    ? "loading"
                    : !items.length
                      ? "empty"
                      : "ready"
                }
                products={items}
                getCartLineQuantity={getCartLineQuantity}
                onCartLineQuantityChange={setProductLineQuantity}
                cardVariant="mobileCompact"
                cardVariantMd="desktopCatalogWide"
                gridClassName="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5"
                empty={
                  <EmptyState
                    title="لا توجد عروض نشطة حالياً"
                    description="لو مفيش خصومات مفعلة في WooCommerce، الصفحة هتفضل فاضية لحد ما تضيف عرض جديد."
                    action={
                      <Link
                        href={ROUTES.PRODUCTS}
                        className="inline-flex h-10 items-center justify-center rounded-md bg-brand-500 px-4 text-sm font-medium text-black transition-colors hover:bg-brand-400"
                      >
                        تصفح كل المنتجات
                      </Link>
                    }
                  />
                }
              />

              {!productsQuery.isPending && !productsQuery.isError && items.length > 0 ? (
                <CatalogPagination
                  currentPage={page}
                  totalPages={totalPages}
                  getHref={getPageHref}
                  aria-label="تصفح صفحات العروض"
                />
              ) : null}
            </section>
          )}
        </ScrollReveal>
      </Container>
    </div>
  );
}
