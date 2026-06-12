"use client";

import { useEffect, useMemo } from "react";
import { Link } from "next-view-transitions";
import { useTransitionRouter } from "next-view-transitions";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useCart } from "@/hooks/useCart";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { DEFAULT_PER_PAGE, ROUTES } from "@/lib/constants";
import { StorefrontStaleDataNotice } from "@/components/storefront-stale-data-notice";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useFlattenedInfiniteProducts } from "@/hooks/useFlattenedInfiniteProducts";
import {
  getChildCategories,
} from "@/features/catalog/lib/catalog-category-tree";
import { CatalogChildCategories } from "@/features/catalog/components/catalog-child-categories";
import { CatalogInfiniteScrollSentinel } from "@/features/catalog/components/catalog-infinite-scroll-sentinel";
import { HomeCategoryExclusiveBanner } from "@/features/home/components/home-category-exclusive-banner";
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
      <p className="mt-1.5 max-w-2xl break-words text-sm text-zinc-700">{description}</p>
      <p className="mt-3">
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
  const hasItems = items.length > 0;
  const showStaleNotice =
    (responseFromCache && hasItems) ||
    (offline && hasItems) ||
    (infiniteQuery.isError && hasItems);
  const staleVariant =
    offline && hasItems ? "offline-cache" : "api-fallback";
  const fatal = infiniteQuery.isError && !hasItems;
  const showRefreshSkeleton =
    infiniteQuery.isFetching &&
    !infiniteQuery.isPending &&
    !fatal &&
    hasItems;

  return fatal ? (
    <ErrorState
      message={infiniteQuery.error?.message ?? "تعذر تحميل المنتجات"}
      onRetry={() => void infiniteQuery.refetch()}
    />
  ) : (
    <div className="relative space-y-4">
      {showStaleNotice ? (
        <div className="mb-3">
          <StorefrontStaleDataNotice variant={staleVariant} />
        </div>
      ) : null}
      <ProductGrid
        status={
          infiniteQuery.isPending || showRefreshSkeleton
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
      {!infiniteQuery.isPending && !fatal && items.length > 0 ? (
        <CatalogInfiniteScrollSentinel
          hasMore={hasNextPage}
          isLoadingMore={isFetchingNextPage}
          onLoadMore={fetchNextPage}
        />
      ) : null}
    </div>
  );
}

/** Skeleton for prerender (Suspense) and the categories list loading state. */
export function CategorySlugPageLoadingFallback() {
  return (
    <div className="space-y-8">
      <div className="h-36 w-full animate-shimmer rounded-2xl bg-gradient-to-r from-image-well via-surface-muted to-image-well sm:h-40" />
      <div className="h-10 w-1/3 max-w-xs animate-shimmer rounded bg-brand-100" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * عميل صفحة تصنيف بالـ slug
 * بالعامية: `useCategories` يحدد الـ id، `useProducts` يجيب الصفحة من الـ API؛ فيه stale notice لو الشبكة رجعت.
 *
 * التفاصيل البصرية تحت.
 */
/*
 * محتوى صفحة تصنيف (/categories/[slug]): يُلفّه `categories/layout.tsx` بسكة أفقية لاصقة للجوال تعرض نفس منطق الكتالوج (أعلى مستوى على الفهرس؛ مع slug نشط = نشط + أبناء أو إخوة حسب الشجرة) وروابط `/products?category=`؛ الشريط الجانبي على lg يبقى بمسارات slug.
 * الترتيب تحت السكة: بانر صورة التصنيف → عنوان ووصف ورابط «كل المنتجات» → من lg شريط «أقسام فرعية» (روابط كتالوج مثل صفحة المنتجات) → شبكة المنتجات.
 * الاستثناءات: سكة الجوال (أب + أبناء) في `categories/layout`؛ شرائح «أقسام فرعية» هنا على الديسكتوب فقط.
 * المسافات بين الأقسام مضغوطة (‎`mt-3`‎–‎`mt-5`‎) لتقليل الشريط الرمادي (‎`bg-page`‎) الظاهر بين البانر والبطاقات.
 */
export function CategorySlugPageContent({ slug }: { slug: string }) {
  const router = useTransitionRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo(0, 0);
  }, [slug]);

  const categoriesNav = useCategories({ per_page: 100 });
  const navCategories = categoriesNav.data;
  const activeCategory = useMemo(
    () => navCategories?.find((category) => category.slug === slug) ?? null,
    [navCategories, slug],
  );

  const categoryId = activeCategory?.id;
  const childCategories = useMemo(() => {
    if (!navCategories || !activeCategory) return [];
    return getChildCategories(navCategories, activeCategory.id);
  }, [navCategories, activeCategory]);

  const productParams = useMemo(
    () =>
      categoryId
        ? {
            category: categoryId,
            per_page: DEFAULT_PER_PAGE,
            include_children: true,
          }
        : undefined,
    [categoryId],
  );

  const catalogInfinite = useFlattenedInfiniteProducts(productParams, {
    enabled: Boolean(categoryId),
  });
  const { getCartLineQuantity, setProductLineQuantity } = useCart();

  if (categoriesNav.isPending) {
    return <CategorySlugPageLoadingFallback />;
  }

  if (categoriesNav.isError && !(categoriesNav.data?.length)) {
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
      <ScrollReveal>
        <HomeCategoryExclusiveBanner category={category} />
      </ScrollReveal>
      <div className="mt-3 lg:mt-4">
        <ScrollReveal>
          <CategorySlugHeader
            categoryId={category.id}
            title={category.name}
            description={category.description}
          />
        </ScrollReveal>
      </div>
      {childCategories.length > 0 ? (
        <div className="mt-3 max-lg:hidden lg:mt-4 lg:block">
          <ScrollReveal>
            <CatalogChildCategories
              subcategories={childCategories}
              activeCategoryId={category.id}
            />
          </ScrollReveal>
        </div>
      ) : null}
      <div className="mt-3 lg:mt-5">
        <ScrollReveal>
          <CategorySlugProductsSection
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
