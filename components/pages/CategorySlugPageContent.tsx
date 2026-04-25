"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "next-view-transitions";
import { useTransitionRouter } from "next-view-transitions";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useCart } from "@/hooks/useCart";
import { DEFAULT_PER_PAGE, ROUTES } from "@/lib/constants";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useProducts } from "@/features/products/hooks/useProducts";
import { CatalogPagination } from "@/features/catalog/components/CatalogPagination";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductSkeleton } from "@/features/products/components/ProductSkeleton";
import type { Product } from "@/features/products/types";

function CategorySlugHeader({
  categoryId,
  title,
  description,
}: {
  categoryId: number;
  title: string;
  description: string;
}) {
  return (
    <div>
      <h1 className="font-display text-xl font-bold tracking-tight text-brand-950 sm:text-2xl md:text-3xl">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl break-words text-sm text-zinc-700">{description}</p>
      <p className="mt-6">
        <Link
          href={`${ROUTES.PRODUCTS}?category=${categoryId}`}
          className="text-sm font-semibold text-brand-900 underline-offset-4 hover:underline"
        >
          تصفح كل المنتجات في هذا التصنيف
        </Link>
      </p>
    </div>
  );
}

function CategorySlugProductsSection({
  productsQuery,
  getCartLineQuantity,
  onCartLineQuantityChange,
  router,
  categorySlug,
  page,
}: {
  productsQuery: ReturnType<typeof useProducts>;
  getCartLineQuantity: (productId: number) => number;
  onCartLineQuantityChange: (product: Product, next: number) => void;
  router: ReturnType<typeof useTransitionRouter>;
  categorySlug: string;
  page: number;
}) {
  const items = productsQuery.data?.items;
  const showRefreshSkeleton =
    productsQuery.isFetching &&
    !productsQuery.isPending &&
    !productsQuery.isError &&
    Boolean(items?.length);
  const totalPages = productsQuery.data?.totalPages ?? 1;

  return productsQuery.isError ? (
    <ErrorState
      message={productsQuery.error.message}
      onRetry={() => void productsQuery.refetch()}
    />
  ) : (
    <div className="relative">
      <ProductGrid
        status={
          productsQuery.isPending || showRefreshSkeleton
            ? "loading"
            : !items?.length
              ? "empty"
              : "ready"
        }
        products={items ?? []}
        getCartLineQuantity={getCartLineQuantity}
        onCartLineQuantityChange={onCartLineQuantityChange}
        cardVariant="mobileCompact"
        cardVariantMd="desktopCatalogWide"
        gridClassName="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4"
        empty={
          <EmptyState
            title="لا توجد منتجات في هذا التصنيف"
            description="جرّب تصنيفاً آخر أو تصفح كل المنتجات."
            action={
              <Button type="button" onClick={() => router.push(ROUTES.PRODUCTS)}>
                تصفح المنتجات
              </Button>
            }
          />
        }
      />
      {!productsQuery.isPending && !productsQuery.isError && items && items.length > 0 ? (
        <CatalogPagination
          currentPage={page}
          totalPages={totalPages}
          getHref={(p) =>
            p <= 1
              ? ROUTES.CATEGORY(categorySlug)
              : `${ROUTES.CATEGORY(categorySlug)}?page=${p}`
          }
        />
      ) : null}
    </div>
  );
}

/** Skeleton for prerender (Suspense) and the categories list loading state. */
export function CategorySlugPageLoadingFallback() {
  return (
    <div className="space-y-8">
      <div className="hidden h-10 w-1/3 max-w-xs animate-shimmer rounded bg-brand-100 lg:block" />
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/*
 * محتوى صفحة تصنيف (/categories/[slug]): يُلفّه layout المشترك بشريط التصنيفات.
 * العنوان التحريري يظهر من lg؛ الشبكة تحتها على كل العرض.
 */
export function CategorySlugPageContent({ slug }: { slug: string }) {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const page = useMemo(
    () => Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1),
    [searchParams],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo(0, 0);
  }, [slug, page]);

  const categoriesNav = useCategories({ per_page: 100 });
  const navCategories = categoriesNav.data;
  const activeCategory = useMemo(
    () => navCategories?.find((category) => category.slug === slug) ?? null,
    [navCategories, slug],
  );

  const categoryId = activeCategory?.id;
  const productParams = useMemo(
    () =>
      categoryId
        ? {
            category: categoryId,
            per_page: DEFAULT_PER_PAGE,
            page,
            include_children: true,
          }
        : undefined,
    [categoryId, page],
  );

  const productsQuery = useProducts(productParams, {
    enabled: Boolean(categoryId),
    keepPreviousData: false,
  });
  const { getCartLineQuantity, setProductLineQuantity } = useCart();

  if (categoriesNav.isPending) {
    return <CategorySlugPageLoadingFallback />;
  }

  if (categoriesNav.isError) {
    return (
      <ErrorState
        message={categoriesNav.error.message}
        onRetry={() => void categoriesNav.refetch()}
      />
    );
  }

  if (!activeCategory) {
    return (
      <EmptyState
        title="التصنيف غير موجود"
        description="تصفح جميع التصنيفات من القائمة."
        action={
          <Button type="button" onClick={() => router.push(ROUTES.CATEGORIES)}>
            كل التصنيفات
          </Button>
        }
      />
    );
  }

  const category = activeCategory;

  return (
    <>
      <div className="hidden lg:block">
        <ScrollReveal>
          <CategorySlugHeader
            categoryId={category.id}
            title={category.name}
            description={category.description}
          />
        </ScrollReveal>
      </div>
      <div className="mt-0 lg:mt-8">
        <ScrollReveal>
          <CategorySlugProductsSection
            productsQuery={productsQuery}
            getCartLineQuantity={getCartLineQuantity}
            onCartLineQuantityChange={setProductLineQuantity}
            router={router}
            categorySlug={slug}
            page={page}
          />
        </ScrollReveal>
      </div>
    </>
  );
}
