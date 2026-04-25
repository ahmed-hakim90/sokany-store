"use client";

import { useQueryClient } from "@tanstack/react-query";
import { STALE_TIME } from "@/lib/constants";
import { getProductsList } from "@/features/products/services/getProducts";
import type { ProductQueryParams } from "@/types";

export function usePrefetchProducts() {
  const queryClient = useQueryClient();

  return function prefetchProducts(params?: ProductQueryParams) {
    return queryClient.prefetchQuery({
      queryKey: ["products", params],
      queryFn: async () => {
        const r = await getProductsList(params);
        return { items: r.products, total: r.total, totalPages: r.totalPages };
      },
      staleTime: STALE_TIME.MEDIUM,
    });
  };
}
