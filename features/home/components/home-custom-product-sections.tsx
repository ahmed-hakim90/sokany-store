"use client";

import { useMemo } from "react";
import { Link } from "next-view-transitions";
import { ScrollReveal } from "@/components/ScrollReveal";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { HomeCategoryExclusiveBanner } from "@/features/home/components/home-category-exclusive-banner";
import { ProductHorizontalRail } from "@/features/home/components/product-horizontal-rail";
import { useHomeCustomProductSectionQueries } from "@/features/home/hooks/useHomeCustomProductSectionQueries";
import { ProductGrid } from "@/features/products/components/ProductGrid";
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

  const queries = useHomeCustomProductSectionQueries(rows.map((r) => r.section));

  if (rows.length === 0) return null;

  const emptyAction = (slug: string) => (
    <Link
      href={ROUTES.CATEGORY(slug)}
      className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-white px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
    >
      التصنيف
    </Link>
  );

  return (
    <div className="space-y-10 sm:space-y-12">
      {rows.map(({ section: s, category }, i) => {
        const q = queries[i];
        if (!q) return null;

        const products = q.data ?? [];
        const railStatus = q.isError
          ? ("error" as const)
          : q.isPending
            ? ("loading" as const)
            : products.length === 0
              ? ("empty" as const)
              : ("ready" as const);

        return (
          <ScrollReveal key={s.id} className="space-y-4">
            <HomeCategoryExclusiveBanner
              category={category}
              sectionBannerSrc={s.bannerImageUrl}
              bannerHref={ROUTES.CATEGORY(category.slug)}
            />

            <section
              className="space-y-3 rounded-2xl"
              aria-labelledby={`home-custom-${s.id}-title`}
            >
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
                  getCartLineQuantity={getCartLineQuantity}
                  onCartLineQuantityChange={onCartLineQuantityChange}
                  errorMessage={
                    q.error instanceof Error ? q.error.message : "تعذر تحميل المنتجات"
                  }
                  onRetry={q.isError ? () => void q.refetch() : undefined}
                  aria-label={category.name}
                  empty={
                    <EmptyState
                      title="لا توجد منتجات في هذا القسم حالياً"
                      description="تصفح التصنيف للمزيد."
                      action={emptyAction(category.slug)}
                    />
                  }
                />
              ) : q.isError ? (
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
                  getCartLineQuantity={getCartLineQuantity}
                  onCartLineQuantityChange={onCartLineQuantityChange}
                  cardVariant="mobileCompact"
                  cardVariantMd="desktopCatalogWide"
                  gridClassName="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5"
                  empty={
                    <EmptyState
                      title="لا توجد منتجات في هذا القسم حالياً"
                      description="تصفح التصنيف للمزيد."
                      action={emptyAction(category.slug)}
                    />
                  }
                />
              )}
            </section>
          </ScrollReveal>
        );
      })}
    </div>
  );
}
