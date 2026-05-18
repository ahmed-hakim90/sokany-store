"use client";

import { useMemo } from "react";
import { CategoryTilesGrid } from "@/features/categories/components/category-tiles-grid";
import { featuredCategoryTiles } from "@/features/categories/content/featured-category-tiles";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { mergeFeaturedCategoryTilesWithApi } from "@/features/categories/lib/merge-featured-category-tiles";

/*
 * سكة بلاطات التصنيفات في /products — نفس بلاطات About/التصنيفات مع روابط ?category=.
 */
export function CatalogCategoryTiles({
  activeCategoryId = null,
  allProductsActive = false,
}: {
  activeCategoryId?: number | null;
  allProductsActive?: boolean;
}) {
  const categoriesQuery = useCategories({ per_page: 100 });
  const tiles = useMemo(
    () =>
      mergeFeaturedCategoryTilesWithApi(
        featuredCategoryTiles,
        categoriesQuery.data,
      ),
    [categoriesQuery.data],
  );

  return (
    <CategoryTilesGrid
      tiles={tiles}
      size="compact"
      layout="scroll-rail"
      linkMode="productsQuery"
      activeCategoryId={activeCategoryId}
      allProductsActive={allProductsActive}
      title="تسوق حسب الفئة"
    />
  );
}
