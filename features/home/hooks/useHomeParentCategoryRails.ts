"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { STALE_TIME } from "@/lib/constants";
import { getProducts } from "@/features/products/services/getProducts";
import type { Category } from "@/features/categories/types";

function parentCategoriesForHome(categories: Category[]): Category[] {
  return [...categories]
    .filter((c) => c.parentId === 0 && c.count > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "ar"));
}

export function useHomeParentCategoryRails(categories: Category[]) {
  const parents = useMemo(() => parentCategoriesForHome(categories), [categories]);

  const queries = useQueries({
    queries: parents.map((cat) => ({
      queryKey: [
        "products",
        {
          category: cat.id,
          include_children: true,
          per_page: 8,
          orderby: "popularity",
          order: "desc",
        },
      ] as const,
      queryFn: () =>
        getProducts({
          category: cat.id,
          include_children: true,
          per_page: 8,
          orderby: "popularity",
          order: "desc",
        }),
      staleTime: STALE_TIME.MEDIUM,
    })),
  });

  return { parents, queries };
}
