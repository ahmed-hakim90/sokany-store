"use client";

import { useCategories } from "@/features/categories/hooks/useCategories";
import { CatalogCategoryDiscovery } from "@/features/catalog/components/catalog-category-discovery";
import { CategoryScrollerSkeleton } from "@/features/categories/components/CategoryScrollerSkeleton";

/*
 * سكة بلاطات التصنيفات في /products — بطاقات كاملة الصورة مع نص overlay
 * (نفس شكل rail chip بعد التوحيد).
 */
export function CatalogCategoryTiles({
  activeCategoryId = null,
  allProductsActive = false,
}: {
  activeCategoryId?: number | null;
  allProductsActive?: boolean;
}) {
  const { data: categories, isLoading } = useCategories({ per_page: 100 });

  if (isLoading || !categories) {
    return <CategoryScrollerSkeleton count={8} variant="circles" />;
  }

  return (
    <CatalogCategoryDiscovery
      categories={categories}
      activeCategoryId={activeCategoryId}
      allProductsActive={allProductsActive}
      variant="chip"
    />
  );
}
