"use client";

/**
 * كتالوج بصفحات متتابعة (infinite scroll) — TanStack `useInfiniteQuery`.
 */
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { STALE_TIME } from "@/lib/constants";
import { getProductsList } from "@/features/products/services/getProducts";
import type { ProductsQueryData } from "@/features/products/hooks/useProducts";
import type { Product } from "@/features/products/types";
import type { ProductQueryParams } from "@/types";

export type InfiniteProductsBaseParams = Omit<ProductQueryParams, "page">;

export function infiniteProductsQueryKey(baseParams: InfiniteProductsBaseParams) {
  return ["products", "infinite", baseParams] as const;
}

export function useInfiniteProducts(
  baseParams: InfiniteProductsBaseParams,
  options?: { enabled?: boolean },
) {
  const queryClient = useQueryClient();

  return useInfiniteQuery({
    queryKey: infiniteProductsQueryKey(baseParams),
    queryFn: async ({ pageParam }): Promise<ProductsQueryData> => {
      const r = await getProductsList({ ...baseParams, page: pageParam });
      for (const p of r.products) {
        queryClient.setQueryData<Product>(["product", p.id], p);
      }
      return {
        items: r.products,
        total: r.total,
        totalPages: r.totalPages,
        responseSource: r.responseSource,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPageParam < lastPage.totalPages ? lastPageParam + 1 : undefined,
    staleTime: STALE_TIME.MEDIUM,
    enabled: options?.enabled !== false,
  });
}
