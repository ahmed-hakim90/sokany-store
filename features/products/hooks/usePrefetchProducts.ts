"use client";

/** Prefetch قائمة + تعبئة كاش العناصر الفردية زي `useProducts`. */
import { useQueryClient } from "@tanstack/react-query";
import { STALE_TIME } from "@/lib/constants";
import { getProductsList } from "@/features/products/services/getProducts";
import type { Product } from "@/features/products/types";
import type { ProductQueryParams } from "@/types";

export function usePrefetchProducts() {
  const queryClient = useQueryClient();

  return function prefetchProducts(params?: ProductQueryParams) {
    return queryClient.prefetchQuery({
      queryKey: ["products", params],
      queryFn: async () => {
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
    });
  };
}
