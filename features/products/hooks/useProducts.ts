"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { STALE_TIME } from "@/lib/constants";
import { getProductsList } from "@/features/products/services/getProducts";
import type { Product } from "@/features/products/types";
import type { ProductQueryParams } from "@/types";

export type ProductsQueryData = {
  items: Product[];
  total: number;
  totalPages: number;
  responseSource?: "network" | "cache-fallback";
};

export function useProducts(
  params?: ProductQueryParams,
  options?: { enabled?: boolean; keepPreviousData?: boolean },
) {
  const queryClient = useQueryClient();
  const keepPrev = options?.keepPreviousData !== false;

  return useQuery({
    queryKey: ["products", params],
    queryFn: async (): Promise<ProductsQueryData> => {
      const r = await getProductsList(params);
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
    staleTime: STALE_TIME.MEDIUM,
    enabled: options?.enabled !== false,
    placeholderData: keepPrev ? (previousData) => previousData : undefined,
  });
}
