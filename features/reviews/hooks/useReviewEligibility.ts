"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "@/hooks/useAuthSession";
import { STALE_TIME } from "@/lib/constants";
import {
  fetchReviewEligibility,
  type ReviewEligibility,
} from "@/features/reviews/services/fetchReviewEligibility";

const guestEligibility: ReviewEligibility = {
  canReview: false,
  mustLogin: true,
  alreadyReviewed: false,
};

/**
 * أهلية كتابة تقييم: يتطلب جلسة؛ يجلب ‎`/api/reviews/eligibility`‎ فقط عند ‎`isAuthenticated`‎.
 */
export function useReviewEligibility(productId: number) {
  const { hasHydrated, isAuthenticated } = useAuthSession();

  const q = useQuery({
    queryKey: ["review-eligibility", productId] as const,
    queryFn: () => fetchReviewEligibility(productId),
    enabled: hasHydrated && isAuthenticated,
    staleTime: STALE_TIME.MEDIUM,
  });

  if (!hasHydrated) {
    return {
      isReady: false,
      isPending: true,
      isError: false,
      data: null as ReviewEligibility | null,
    };
  }

  if (!isAuthenticated) {
    return {
      isReady: true,
      isPending: false,
      isError: false,
      data: guestEligibility,
    };
  }

  return {
    isReady: q.isSuccess,
    isPending: q.isPending,
    data: (q.data ?? null) as ReviewEligibility | null,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
  };
}
