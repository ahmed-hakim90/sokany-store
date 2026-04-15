"use client";

import { useQuery } from "@tanstack/react-query";
import { STALE_TIME } from "@/lib/constants";
import { getProductById } from "@/features/products/services/getProductById";

export function useProduct(id: number) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    staleTime: STALE_TIME.MEDIUM,
    enabled: id > 0,
  });
}
