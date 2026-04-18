"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { useCart } from "@/hooks/useCart";
import { ROUTES } from "@/lib/constants";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { CategoryBrowseSplitLayout } from "@/features/categories/components/category-browse-split-layout";
import { useProducts } from "@/features/products/hooks/useProducts";
import { CatalogPromoTile } from "@/features/catalog/components/catalog-promo-tile";
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
}: {
  productsQuery: ReturnType<typeof useProducts>;
  getCartLineQuantity: (productId: number) => number;
  onCartLineQuantityChange: (product: Product, next: number) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const showRefreshSkeleton =
    productsQuery.isFetching &&
    !productsQuery.isPending &&
    !productsQuery.isError &&
    Boolean(productsQuery.data?.length);

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
            : !productsQuery.data?.length
              ? "empty"
              : "ready"
        }
        products={productsQuery.data ?? []}
        getCartLineQuantity={getCartLineQuantity}
        onCartLineQuantityChange={onCartLineQuantityChange}
        cardVariant="mobileCompact"
        cardVariantMd="desktopCatalogWide"
        leadingSlot={<CatalogPromoTile />}
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
    </div>
  );
}

/*
 * صفحة تصنيف بالمسار (/categories/[slug]): نفس منطق التقسيم مثل صفحة التصنيفات الجذرية —
 * تحت lg عمود تمرير + CategoryCatalogRail؛ من lg شبكة مع CategorySidebar فقط عند توفر التنقل.
 * أعلى المحتوى: اسم التصنيف ووصف ورابط لكل منتجات التصنيف في الكتالوج.
 */
export function CategorySlugPageContent({ slug }: { slug: string }) {
  const router = useRouter();
  const categoriesNav = useCategories();
  const navCategories = categoriesNav.data;
  const activeCategory = useMemo(
    () => navCategories?.find((category) => category.slug === slug) ?? null,
    [navCategories, slug],
  );

  const categoryId = activeCategory?.id;
  const productParams = useMemo(
    () =>
      categoryId
        ? { category: categoryId, per_page: 12, page: 1 }
        : undefined,
    [categoryId],
  );

  const productsQuery = useProducts(productParams, {
    enabled: Boolean(categoryId),
    keepPreviousData: true,
  });
  const { getCartLineQuantity, setProductLineQuantity } = useCart();

  const hasNavCategories = Boolean(navCategories?.length);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Container className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-10">
        {/* تحميل / خطأ / غير موجود: حالات بعرض الحاوية */}
        {categoriesNav.isPending ? (
          <div className="space-y-8">
            <div className="h-10 w-1/3 animate-shimmer rounded bg-brand-100" />
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : categoriesNav.isError ? (
          <ErrorState
            message={categoriesNav.error.message}
            onRetry={() => void categoriesNav.refetch()}
          />
        ) : !activeCategory ? (
          <EmptyState
            title="التصنيف غير موجود"
            description="تصفح جميع التصنيفات من القائمة."
            action={
              <Button type="button" onClick={() => router.push(ROUTES.CATEGORIES)}>
                كل التصنيفات
              </Button>
            }
          />
        ) : (() => {
          const category = activeCategory;
          return (
            <CategoryBrowseSplitLayout
              categories={navCategories ?? []}
              activeSlug={slug}
              showNavChrome={hasNavCategories}
              renderMainContent={(viewport) => (
                <>
                  {viewport === "desktop" ? (
                    <CategorySlugHeader
                      categoryId={category.id}
                      title={category.name}
                      description={category.description}
                    />
                  ) : null}
                  <div className={viewport === "desktop" ? "mt-8" : undefined}>
                    <CategorySlugProductsSection
                      productsQuery={productsQuery}
                      getCartLineQuantity={getCartLineQuantity}
                      onCartLineQuantityChange={setProductLineQuantity}
                      router={router}
                    />
                  </div>
                </>
              )}
            />
          );
        })()}
      </Container>
    </div>
  );
}
