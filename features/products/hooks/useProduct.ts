"use client";

/**
 * منتج واحد (عميل)
 * بالعامية: `queryKey` ثابت `["product", id]` علشان يتطابق مع الـ prefetch والـ invalidate من ويبهوك/SW.
 *
 * شوف كمان: `@/features/products/services/getProductById.ts`
 */
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
