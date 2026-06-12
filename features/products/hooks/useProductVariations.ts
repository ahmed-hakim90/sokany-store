"use client";

import { useQuery } from "@tanstack/react-query";
import { STALE_TIME } from "@/lib/constants";
import { getProductVariations } from "@/features/products/services/getProductVariations";

export function useProductVariations(productId: number, enabled: boolean) {
  return useQuery({
    queryKey: ["product-variations", productId],
    queryFn: () => getProductVariations(productId, { commerceTrust: true }),
    staleTime: STALE_TIME.COMMERCE,
    refetchOnMount: "always",
    enabled: enabled && productId > 0,
  });
}
