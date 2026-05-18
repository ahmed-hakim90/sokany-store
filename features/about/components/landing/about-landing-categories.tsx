"use client";

import { useMemo } from "react";
import { CategoryTilesGrid } from "@/features/categories/components/category-tiles-grid";
import { featuredCategoryTiles } from "@/features/categories/content/featured-category-tiles";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { mergeFeaturedCategoryTilesWithApi } from "@/features/categories/lib/merge-featured-category-tiles";

/*
 * تسوق حسب الفئة — يعيد استخدام شبكة البلاطات المشتركة (حجم افتراضي).
 * الصور من Woo عند التوفّر؛ النصوص والروابط من البلاطات المميزة الثابتة.
 */
export function AboutLandingCategories() {
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
      size="default"
      layout="section"
      titleId="about-categories-title"
    />
  );
}
