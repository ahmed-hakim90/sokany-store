"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { useCart } from "@/hooks/useCart";
import { ROUTES } from "@/lib/constants";
import { CatalogPagination } from "@/features/catalog/components/CatalogPagination";
import { useProducts } from "@/features/products/hooks/useProducts";
import { ProductGrid } from "@/features/products/components/ProductGrid";
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
      per_page: 12,
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
        <CategoriesIntro />
      </div>
      <div className="mt-0 lg:mt-8">
        <AvailableProductsSection
          productsQuery={productsQuery}
          getCartLineQuantity={getCartLineQuantity}
          onCartLineQuantityChange={setProductLineQuantity}
          router={router}
          page={page}
        />
      </div>
    </>
  );
}
