"use client";

import { useQueryClient } from "@tanstack/react-query";
import { STALE_TIME } from "@/lib/constants";
import { getProducts } from "@/features/products/services/getProducts";
import type { ProductQueryParams } from "@/types";

export function usePrefetchProducts() {
  const queryClient = useQueryClient();

  return function prefetchProducts(params?: ProductQueryParams) {
    return queryClient.prefetchQuery({
      queryKey: ["products", params],
      queryFn: () => getProducts(params),
      staleTime: STALE_TIME.MEDIUM,
    });
  };
}
