"use client";

import { useMemo } from "react";
import { Link } from "next-view-transitions";
import { ScrollReveal } from "@/components/ScrollReveal";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { StorefrontStaleDataNotice } from "@/components/storefront-stale-data-notice";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useNearViewport } from "@/hooks/useNearViewport";
import { HomeCategoryExclusiveBanner } from "@/features/home/components/home-category-exclusive-banner";
import { HomeProductRailPlaceholder } from "@/features/home/components/home-product-rail-placeholder";
import { ProductHorizontalRail } from "@/features/home/components/product-horizontal-rail";
import {
  HOME_RAIL_PER_PAGE,
  homeCustomSectionProductParams,
} from "@/features/home/lib/home-page-product-params";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { defaultProductGridClassName } from "@/features/products/lib/product-card-layout";
import { useProducts } from "@/features/products/hooks/useProducts";
import type { Category } from "@/features/categories/types";
import type { Product } from "@/features/products/types";
import { ROUTES } from "@/lib/constants";
import type { CmsHomeProductSection } from "@/schemas/cms";

export type HomeCustomProductSectionsProps = {
  sections: CmsHomeProductSection[];
  categories: Category[];
  getCartLineQuantity: (productId: number) => number;
  onCartLineQuantityChange: (product: Product, next: number) => void;
};

function HomeCustomSectionRow({
  section: s,
  category,
  getCartLineQuantity,
  onCartLineQuantityChange,
}: {
  section: CmsHomeProductSection;
  category: Category;
  getCartLineQuantity: (productId: number) => number;
  onCartLineQuantityChange: (product: Product, next: number) => void;
}) {
  const { offline } = useNetworkStatus();
  const { ref, near } = useNearViewport();
  const params = homeCustomSectionProductParams(s.categoryId, s.productCount);
  const q = useProducts(params, { enabled: near });
  const products = q.data?.items ?? [];

  if (near && q.isSuccess && products.length === 0 && !q.isError) {
    return null;
  }

  const stale =
    (q.data?.responseSource === "cache-fallback" && products.length > 0) ||
    (offline && products.length > 0) ||
    (q.isError && products.length > 0);
  const staleVariant =
    offline && products.length > 0 ? "offline-cache" : "api-fallback";

  const fatal = q.isError && !products.length;

  const railStatus =
    q.isError && !products.length
      ? ("error" as const)
      : q.isPending
        ? ("loading" as const)
        : products.length === 0
          ? ("empty" as const)
          : ("ready" as const);

  const emptyAction = (
    <Link
      href={ROUTES.CATEGORY(category.slug)}
      className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-white px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
    >
      التصنيف
    </Link>
  );

  return (
    <ScrollReveal className="space-y-4">
      <div ref={ref} className="space-y-4">
        {!near ? (
          <HomeProductRailPlaceholder aria-label={category.name} />
        ) : fatal ? (
          <ErrorState
            message={q.error instanceof Error ? q.error.message : "تعذر تحميل المنتجات"}
            onRetry={() => void q.refetch()}
          />
        ) : (
          <>
            <HomeCategoryExclusiveBanner
              category={category}
              sectionBannerSrc={s.bannerImageUrl}
              bannerHref={ROUTES.CATEGORY(category.slug)}
            />

            <section
              className="space-y-3 rounded-2xl"
              aria-labelledby={`home-custom-${s.id}-title`}
            >
              {stale ? <StorefrontStaleDataNotice variant={staleVariant} /> : null}
              <div className="flex flex-col items-center gap-2 text-center">
                <h2
                  id={`home-custom-${s.id}-title`}
                  className="text-base font-bold tracking-tight text-black sm:text-lg md:text-xl"
                >
                  {category.name}
                </h2>
                <Link
                  href={ROUTES.CATEGORY(category.slug)}
                  className="text-xs font-semibold text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline sm:text-sm"
                >
                  عرض الكل
                </Link>
              </div>

              {s.layout === "horizontal" ? (
                <ProductHorizontalRail
                  status={railStatus}
                  products={products}
                  priorityImageSlots={0}
                  simpleImageMode
                  imageMotion={false}
                  imageInteractions={false}
                  getCartLineQuantity={getCartLineQuantity}
                  onCartLineQuantityChange={onCartLineQuantityChange}
                  errorMessage={
                    q.error instanceof Error ? q.error.message : "تعذر تحميل المنتجات"
                  }
                  onRetry={q.isError ? () => void q.refetch() : undefined}
                  skeletonCount={HOME_RAIL_PER_PAGE}
                  aria-label={category.name}
                  empty={
                    <EmptyState
                      title="لا توجد منتجات في هذا القسم حالياً"
                      description="تصفح التصنيف للمزيد."
                      action={emptyAction}
                    />
                  }
                />
              ) : q.isError && !products.length ? (
                <ErrorState
                  message={
                    q.error instanceof Error ? q.error.message : "تعذر تحميل المنتجات"
                  }
                  onRetry={() => void q.refetch()}
                />
              ) : (
                <ProductGrid
                  status={
                    q.isPending ? "loading" : products.length === 0 ? "empty" : "ready"
                  }
                  products={products}
                  skeletonCount={HOME_RAIL_PER_PAGE}
                  priorityImageSlots={0}
                  simpleImageMode
                  imageMotion={false}
                  imageInteractions={false}
                  getCartLineQuantity={getCartLineQuantity}
                  onCartLineQuantityChange={onCartLineQuantityChange}
                  cardVariant="mobileCompact"
                  cardVariantMd="desktopCatalogWide"
                  gridClassName={defaultProductGridClassName}
                  empty={
                    <EmptyState
                      title="لا توجد منتجات في هذا القسم حالياً"
                      description="تصفح التصنيف للمزيد."
                      action={emptyAction}
                    />
                  }
                />
              )}
            </section>
          </>
        )}
      </div>
    </ScrollReveal>
  );
}

export function HomeCustomProductSections({
  sections,
  categories,
  getCartLineQuantity,
  onCartLineQuantityChange,
}: HomeCustomProductSectionsProps) {
  const rows = useMemo(() => {
    const catById = new Map(categories.map((c) => [c.id, c]));
    return sections
      .filter((s) => s.active)
      .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
      .map((s) => {
        const category = catById.get(s.categoryId);
        return category ? { section: s, category } : null;
      })
      .filter((x): x is { section: CmsHomeProductSection; category: Category } => x != null);
  }, [sections, categories]);

  if (rows.length === 0) return null;

  return (
    <div className="space-y-10 sm:space-y-12">
      {rows.map(({ section: s, category }) => (
        <HomeCustomSectionRow
          key={s.id}
          section={s}
          category={category}
          getCartLineQuantity={getCartLineQuantity}
          onCartLineQuantityChange={onCartLineQuantityChange}
        />
      ))}
    </div>
  );
}
