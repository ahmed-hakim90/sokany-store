"use client";

import { useQuery } from "@tanstack/react-query";
import { STALE_TIME } from "@/lib/constants";
import { reviewQueryKey } from "@/features/reviews/query-keys";
import { getReviews } from "@/features/reviews/services/getReviews";

export function useReviews(productId: number) {
  return useQuery({
    queryKey: reviewQueryKey(productId),
    queryFn: () => getReviews(productId),
    staleTime: STALE_TIME.MEDIUM,
    enabled: productId > 0,
  });
}
