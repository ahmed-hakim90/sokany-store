"use client";

import { useQueryClient } from "@tanstack/react-query";
import { STALE_TIME } from "@/lib/constants";
import { getProductById } from "@/features/products/services/getProductById";

export function usePrefetchProduct() {
  const queryClient = useQueryClient();

  return function prefetchProduct(productId: number) {
    return queryClient.prefetchQuery({
      queryKey: ["product", productId],
      queryFn: () => getProductById(productId),
      staleTime: STALE_TIME.MEDIUM,
    });
  };
}
