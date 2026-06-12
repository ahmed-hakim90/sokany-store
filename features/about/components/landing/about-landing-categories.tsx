"use client";

import { useMemo } from "react";
import { CategoryTilesGrid } from "@/features/categories/components/category-tiles-grid";
import { featuredCategoryTiles } from "@/features/categories/content/featured-category-tiles";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { mergeFeaturedCategoryTilesWithApi } from "@/features/categories/lib/merge-featured-category-tiles";
import {
  aboutLandingInnerContainerClass,
  aboutLandingMutedSectionClass,
} from "@/features/about/components/landing/about-landing-surfaces";

/*
 * تسوق حسب الفئة — قسم muted (slate-50)؛ شبكة البلاطات المشتركة.
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
    <section className={aboutLandingMutedSectionClass}>
      <div className={aboutLandingInnerContainerClass}>
        <CategoryTilesGrid
          tiles={tiles}
          size="default"
          layout="section"
          titleId="about-categories-title"
        />
      </div>
    </section>
  );
}
