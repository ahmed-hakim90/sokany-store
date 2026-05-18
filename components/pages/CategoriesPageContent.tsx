"use client";

import { useMemo } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useCart } from "@/hooks/useCart";
import { useFlattenedInfiniteProducts } from "@/hooks/useFlattenedInfiniteProducts";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { StorefrontStaleDataNotice } from "@/components/storefront-stale-data-notice";
import { DEFAULT_PER_PAGE, ROUTES } from "@/lib/constants";
import { CatalogInfiniteScrollSentinel } from "@/features/catalog/components/catalog-infinite-scroll-sentinel";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductSkeleton } from "@/features/products/components/ProductSkeleton";
import type { Product } from "@/features/products/types";

function CategoriesIntro() {
  return (
    <div>
      <h1 className="font-display text-xl font-bold tracking-tight text-brand-950 sm:text-2xl md:text-3xl">
        التصنيفات
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        تصفّح الأقسام من الجانب واطّلع على منتجات متاحة بسرعة.
      </p>
    </div>
  );
}

/*
 * قسم «منتجات متاحة»: شبكة المنتجات داخل العمود الرئيسي — تمرير لانهائي.
 */
function AvailableProductsSection({
  items,
  infiniteQuery,
  responseFromCache,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  getCartLineQuantity,
  onCartLineQuantityChange,
  router,
}: {
  items: Product[];
  infiniteQuery: ReturnType<typeof useFlattenedInfiniteProducts>["infiniteQuery"];
  responseFromCache: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  getCartLineQuantity: (productId: number) => number;
  onCartLineQuantityChange: (product: Product, next: number) => void;
  router: ReturnType<typeof useTransitionRouter>;
}) {
  const { offline } = useNetworkStatus();
  const showStaleNotice =
    (responseFromCache && items.length > 0) ||
    (offline && items.length > 0) ||
    (infiniteQuery.isError && items.length > 0);
  const staleVariant =
    offline && items.length > 0 ? "offline-cache" : "api-fallback";
  const fatal = infiniteQuery.isError && items.length === 0;

  return (
    <section
      className="space-y-3 rounded-2xl lg:p-0"
      aria-labelledby="categories-available-products-title"
    >
      {fatal ? (
        <ErrorState
          message={infiniteQuery.error?.message ?? "تعذر تحميل المنتجات"}
          onRetry={() => void infiniteQuery.refetch()}
        />
      ) : (
        <>
          {showStaleNotice ? (
            <div className="mb-3">
              <StorefrontStaleDataNotice variant={staleVariant} />
            </div>
          ) : null}
          <ProductGrid
            status={
              infiniteQuery.isPending && items.length === 0
                ? "loading"
                : !items.length
                  ? "empty"
                  : "ready"
            }
            products={items}
            virtualize="auto"
            getCartLineQuantity={getCartLineQuantity}
            onCartLineQuantityChange={onCartLineQuantityChange}
            cardVariant="mobileCompact"
            cardVariantMd="desktopCatalogWide"
            gridClassName="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5"
            empty={
              <EmptyState
                title="لا توجد منتجات حالياً"
                description="تصفح الكتالوج الكامل من صفحة المنتجات."
                action={
                  <Button type="button" onClick={() => router.push(ROUTES.PRODUCTS)}>
                    المنتجات
                  </Button>
                }
              />
            }
          />
          {!infiniteQuery.isPending && !fatal && items.length > 0 ? (
            <CatalogInfiniteScrollSentinel
              hasMore={hasNextPage}
              isLoadingMore={isFetchingNextPage}
              onLoadMore={fetchNextPage}
            />
          ) : null}
        </>
      )}
    </section>
  );
}

/** Prerender (Suspense) fallback — matches main layout while client shell hydrates. */
export function CategoriesPageLoadingFallback() {
  return (
    <>
      <div className="hidden lg:block">
        <div className="h-8 w-40 max-w-full animate-shimmer rounded bg-brand-100" />
        <div className="mt-1 h-4 w-2/3 max-w-md animate-shimmer rounded bg-zinc-100" />
      </div>
      <div className="mt-0 lg:mt-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  );
}

/*
 * محتوى فهرس التصنيفات (/categories):
 * — الجوال: سكة بلاطات الفئات في `categories/layout` تحت الهيدر؛ هنا شبكة المنتجات بالتمرير اللانهائي.
 * — lg+: مقدمة + شريط جانبي نصي (من التخطيط) + نفس شبكة المنتجات.
 */
export function CategoriesPageContent() {
  const router = useTransitionRouter();

  const productParams = useMemo(
    () => ({
      per_page: DEFAULT_PER_PAGE,
      orderby: "popularity" as const,
      order: "desc" as const,
    }),
    [],
  );

  const catalogInfinite = useFlattenedInfiniteProducts(productParams);
  const { getCartLineQuantity, setProductLineQuantity } = useCart();

  return (
    <>
      <h1 className="sr-only lg:hidden">تصنيفات سوكاني المصرية</h1>
      <div className="hidden lg:block">
        <ScrollReveal>
          <CategoriesIntro />
        </ScrollReveal>
      </div>
      <div className="mt-0 lg:mt-8">
        <ScrollReveal>
          <AvailableProductsSection
            items={catalogInfinite.items}
            infiniteQuery={catalogInfinite.infiniteQuery}
            responseFromCache={catalogInfinite.responseFromCache}
            hasNextPage={catalogInfinite.hasNextPage}
            fetchNextPage={catalogInfinite.fetchNextPage}
            isFetchingNextPage={catalogInfinite.isFetchingNextPage}
            getCartLineQuantity={getCartLineQuantity}
            onCartLineQuantityChange={setProductLineQuantity}
            router={router}
          />
        </ScrollReveal>
      </div>
    </>
  );
}
