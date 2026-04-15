"use client";

import { useQuery } from "@tanstack/react-query";
import { STALE_TIME } from "@/lib/constants";
import { getProducts } from "@/features/products/services/getProducts";
import type { ProductQueryParams } from "@/types";

export function useProducts(
  params?: ProductQueryParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
    staleTime: STALE_TIME.MEDIUM,
    enabled: options?.enabled !== false,
  });
}
