"use client";

import { useCallback, useEffect } from "react";
import { Link } from "next-view-transitions";
import { Container } from "@/components/Container";
import { ScrollReveal } from "@/components/ScrollReveal";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { useCart } from "@/hooks/useCart";
import { useProductsCatalog } from "@/hooks/useProductsCatalog";
import { ROUTES } from "@/lib/constants";
import { focusProductSearchHeaderInput } from "@/lib/product-search-header";
import { CatalogPagination } from "@/features/catalog/components/CatalogPagination";
import { ProductGrid } from "@/features/products/components/ProductGrid";

/*
 * صفحة الكتالوج (/products):
 * رأس بسيط ثم شبكة المنتجات؛ التصفية (تصنيف، سعر، ترتيب، مميز) تُفتح من درج الفلتر بجانب البحث في الشريط العلوي.
 */
export function ProductsPageContent() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#catalog-search") return;
    const frame = window.requestAnimationFrame(() => {
      focusProductSearchHeaderInput();
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const { productsQuery, searchParams, catalogParams } = useProductsCatalog();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [searchParams]);

  const { getCartLineQuantity, setProductLineQuantity } = useCart();

  const getPageHref = useCallback(
    (page: number) => {
      const sp = new URLSearchParams(searchParams.toString());
      if (page <= 1) sp.delete("page");
      else sp.set("page", String(page));
      const q = sp.toString();
      return q ? `${ROUTES.PRODUCTS}?${q}` : ROUTES.PRODUCTS;
    },
    [searchParams],
  );

  const pagedItems = productsQuery.data?.items ?? [];
  const totalPages = productsQuery.data?.totalPages ?? 1;
  const currentCatalogPage = catalogParams.page ?? 1;

  const catalogGrid = productsQuery.isError ? (
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
            : !pagedItems.length
              ? "empty"
              : "ready"
        }
        products={pagedItems}
        getCartLineQuantity={getCartLineQuantity}
        onCartLineQuantityChange={setProductLineQuantity}
        cardVariant="mobileCompact"
        cardVariantMd="desktopCatalogWide"
        gridClassName="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4"
        empty={
          <EmptyState
            title="لا توجد منتجات"
            description="جرّب بحثاً آخر أو اضبط التصفية من أيقونة الفلتر بجانب البحث."
            action={
              <Link
                href={ROUTES.PRODUCTS}
                className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-white px-4 text-sm font-medium text-foreground hover:bg-surface-muted"
              >
                إعادة التعيين
              </Link>
            }
          />
        }
      />
      {!productsQuery.isPending && !productsQuery.isError && pagedItems.length > 0 ? (
        <CatalogPagination
          currentPage={currentCatalogPage}
          totalPages={totalPages}
          getHref={getPageHref}
        />
      ) : null}
    </>
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Container className="flex min-h-0 flex-1 flex-col sm:px-2 lg:px-8 lg:py-10">
        <ScrollReveal className="shrink-0">
          <h1 className="font-display text-xl font-bold tracking-tight text-brand-950 sm:text-2xl md:text-3xl">
            المنتجات
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            تصفّح الكتالوج؛ استخدم أيقونة التصفية بجانب البحث لاختيار التصنيف والسعر والترتيب.
          </p>
        </ScrollReveal>

        <ScrollReveal className="mt-6 min-w-0 pb-4">{catalogGrid}</ScrollReveal>
      </Container>
    </div>
  );
}
