"use client";

import { useQuery } from "@tanstack/react-query";
import { STALE_TIME } from "@/lib/constants";
import { getProductsList } from "@/features/products/services/getProducts";
import type { Product } from "@/features/products/types";
import type { ProductQueryParams } from "@/types";

export type ProductsQueryData = {
  items: Product[];
  total: number;
  totalPages: number;
};

export function useProducts(
  params?: ProductQueryParams,
  options?: { enabled?: boolean; keepPreviousData?: boolean },
) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async (): Promise<ProductsQueryData> => {
      const r = await getProductsList(params);
      return { items: r.products, total: r.total, totalPages: r.totalPages };
    },
    staleTime: STALE_TIME.MEDIUM,
    enabled: options?.enabled !== false,
    placeholderData: options?.keepPreviousData
      ? (previousData) => previousData
      : undefined,
  });
}
