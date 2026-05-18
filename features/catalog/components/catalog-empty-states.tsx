"use client";

import { Link } from "next-view-transitions";
import { Button } from "@/components/Button";
import { StorefrontEmptyState } from "@/components/StorefrontEmptyState";
import { CategoryNavChip } from "@/features/categories/components/category-nav-chip";
import { ProductCarouselRow } from "@/features/products/components/product-carousel-row";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import type { Category } from "@/features/categories/types";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type CatalogEmptyStatesProps = {
  variant: "category" | "filters";
  relatedCategories?: Category[];
  className?: string;
};

/*
 * حالات فارغة للكتالوج — تصنيف بلا منتجات أو فلاتر بلا نتائج + الأكثر مبيعاً.
 */
export function CatalogEmptyStates({
  variant,
  relatedCategories = [],
  className,
}: CatalogEmptyStatesProps) {
  const { getCartLineQuantity, setProductLineQuantity } = useCart();
  const bestSellersQuery = useProducts({ orderby: "popularity", per_page: 8 });
  const carouselStatus = bestSellersQuery.isLoading
    ? "loading"
    : (bestSellersQuery.data?.items.length ?? 0) > 0
      ? "ready"
      : "empty";

  const isCategory = variant === "category";

  return (
    <div className={cn("space-y-8", className)}>
      <StorefrontEmptyState
        title={
          isCategory
            ? "مفيش منتجات في التصنيف ده حالياً"
            : "لا توجد منتجات بهذه التصفية"
        }
        description={
          isCategory
            ? "جرّب تصنيفاً آخر أو تصفّح كل المنتجات — فريق الدعم يساعدك في الاختيار."
            : "أزل بعض الفلاتر أو جرّب تصنيفاً قريباً من اختيارك."
        }
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Link href={ROUTES.PRODUCTS}>
              <Button type="button" variant="primary" size="md">
                عرض كل المنتجات
              </Button>
            </Link>
            <Link href={ROUTES.CONTACT}>
              <Button type="button" variant="secondary" size="md">
                تواصل معنا
              </Button>
            </Link>
            {!isCategory ? (
              <Link href={ROUTES.PRODUCTS}>
                <Button type="button" variant="ghost" size="md">
                  مسح الفلاتر
                </Button>
              </Link>
            ) : null}
          </div>
        }
      />

      {!isCategory && relatedCategories.length > 0 ? (
        <section aria-label="تصنيفات مقترحة">
          <h2 className="mb-3 font-display text-base font-semibold text-brand-950">
            تصنيفات قريبة
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {relatedCategories.slice(0, 6).map((c) => (
              <CategoryNavChip
                key={c.id}
                href={`${ROUTES.PRODUCTS}?category=${c.id}`}
                label={c.name}
                count={c.count > 0 ? c.count : null}
                imageSrc={c.image}
                iconSlug={c.slug}
                scroll={false}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="catalog-bestsellers-heading">
        <h2
          id="catalog-bestsellers-heading"
          className="font-display text-base font-semibold text-brand-950 sm:text-lg"
        >
          الأكثر مبيعاً
        </h2>
        <ProductCarouselRow
          className="mt-4"
          status={carouselStatus}
          products={bestSellersQuery.data?.items ?? []}
          getCartLineQuantity={getCartLineQuantity}
          onCartLineQuantityChange={setProductLineQuantity}
        />
      </section>
    </div>
  );
}
