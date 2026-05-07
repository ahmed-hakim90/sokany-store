"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { STALE_TIME } from "@/lib/constants";
import { getProducts } from "@/features/products/services/getProducts";
import { parentCategoriesForHome } from "@/features/home/lib/parentCategoriesForHome";
import { homeParentCategoryRailParams } from "@/features/home/lib/home-page-product-params";
import type { Category } from "@/features/categories/types";

export function useHomeParentCategoryRails(categories: Category[]) {
  const parents = useMemo(() => parentCategoriesForHome(categories), [categories]);

  const queries = useQueries({
    queries: parents.map((cat) => {
      const params = homeParentCategoryRailParams(cat.id);
      return {
        queryKey: ["products", params] as const,
        queryFn: () => getProducts(params),
        staleTime: STALE_TIME.MEDIUM,
      };
    }),
  });

  return { parents, queries };
}
