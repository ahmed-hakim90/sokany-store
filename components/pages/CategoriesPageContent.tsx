"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useCart } from "@/hooks/useCart";
import { DEFAULT_PER_PAGE, ROUTES } from "@/lib/constants";
import { CatalogPagination } from "@/features/catalog/components/CatalogPagination";
import { useProducts } from "@/features/products/hooks/useProducts";
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
 * قسم «منتجات متاحة»: شبكة المنتجات داخل العمود الرئيسي.
 */
function AvailableProductsSection({
  productsQuery,
  getCartLineQuantity,
  onCartLineQuantityChange,
  router,
  page,
}: {
  productsQuery: ReturnType<typeof useProducts>;
  getCartLineQuantity: (productId: number) => number;
  onCartLineQuantityChange: (product: Product, next: number) => void;
  router: ReturnType<typeof useTransitionRouter>;
  page: number;
}) {
  const items = productsQuery.data?.items ?? [];
  const totalPages = productsQuery.data?.totalPages ?? 1;
  return (
    <section
      className="space-y-3 rounded-2xl  lg:p-0"
      aria-labelledby="categories-available-products-title"
    >
      {/* <div className="flex flex-col items-center gap-2 text-center">
        <h2
          id="categories-available-products-title"
          className="text-base font-bold tracking-tight text-black sm:text-lg md:text-xl"
        >
          منتجات متاحة
        </h2>
      </div> */}

      {productsQuery.isError ? (
        <ErrorState
          message={productsQuery.error.message}
          onRetry={() => void productsQuery.refetch()}
        />
      ) : (
        <>
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
            onCartLineQuantityChange={onCartLineQuantityChange}
            cardVariant="mobileCompact"
            cardVariantMd="desktopCatalogWide"
            gridClassName="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4"
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
          {!productsQuery.isPending && !productsQuery.isError && items.length > 0 ? (
            <CatalogPagination
              currentPage={page}
              totalPages={totalPages}
              getHref={(p) => (p <= 1 ? ROUTES.CATEGORIES : `${ROUTES.CATEGORIES}?page=${p}`)}
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
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  );
}

/*
 * محتوى فهرس التصنيفات (/categories): يُلفّه `app/categories/layout.tsx` بشريط تصنيفات + sidebar.
 * المقدمة تظهر من lg؛ تحتها قسم المنتجات الشائعة.
 */
export function CategoriesPageContent() {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const page = useMemo(
    () => Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1),
    [searchParams],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo(0, 0);
  }, [searchParams]);

  const productParams = useMemo(
    () => ({
      page,
      per_page: DEFAULT_PER_PAGE,
      orderby: "popularity" as const,
      order: "desc" as const,
    }),
    [page],
  );
  const productsQuery = useProducts(productParams);
  const { getCartLineQuantity, setProductLineQuantity } = useCart();

  return (
    <>
      <div className="hidden lg:block">
        <ScrollReveal>
          <CategoriesIntro />
        </ScrollReveal>
      </div>
      <div className="mt-0 lg:mt-8">
        <ScrollReveal>
          <AvailableProductsSection
            productsQuery={productsQuery}
            getCartLineQuantity={getCartLineQuantity}
            onCartLineQuantityChange={setProductLineQuantity}
            router={router}
            page={page}
          />
        </ScrollReveal>
      </div>
    </>
  );
}
