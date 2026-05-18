"use client";

import { useCallback, useMemo, useRef } from "react";
import {
  useInfiniteProducts,
  type InfiniteProductsBaseParams,
} from "@/features/products/hooks/useInfiniteProducts";

const EMPTY_PARAMS: InfiniteProductsBaseParams = { per_page: 20 };

/**
 * قائمة منتجات مسطّحة + تحميل الصفحة التالية (infinite scroll).
 */
export function useFlattenedInfiniteProducts(
  baseParams: InfiniteProductsBaseParams | undefined,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled !== false && baseParams != null;

  const infiniteQuery = useInfiniteProducts(baseParams ?? EMPTY_PARAMS, {
    enabled,
  });

  const items = useMemo(
    () => infiniteQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [infiniteQuery.data],
  );

  const firstPage = infiniteQuery.data?.pages[0];
  const total = firstPage?.total ?? 0;
  const totalPages = firstPage?.totalPages ?? 1;
  const hasNextPage = infiniteQuery.hasNextPage ?? false;

  const fetchNextRef = useRef(infiniteQuery.fetchNextPage);
  fetchNextRef.current = infiniteQuery.fetchNextPage;

  const fetchNextPage = useCallback(() => {
    if (!hasNextPage || infiniteQuery.isFetchingNextPage) return;
    void fetchNextRef.current();
  }, [hasNextPage, infiniteQuery.isFetchingNextPage]);

  const responseFromCache = useMemo(
    () =>
      infiniteQuery.data?.pages.some(
        (page) => page.responseSource === "cache-fallback",
      ) ?? false,
    [infiniteQuery.data],
  );

  return {
    infiniteQuery,
    items,
    total,
    totalPages,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    responseFromCache,
  };
}
