"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReviewPayloadSchema } from "@/schemas/wordpress";
import { reviewQueryKey } from "@/features/reviews/query-keys";
import { createReview } from "@/features/reviews/services/createReview";
import type { CreateReviewPayload, Review } from "@/features/reviews/types";

function toRequestBody(input: CreateReviewPayload) {
  return createReviewPayloadSchema.parse({
    product_id: input.productId,
    review: input.review,
    reviewer: input.reviewer,
    reviewer_email: input.reviewerEmail,
    rating: input.rating,
  });
}

function optimisticReview(productId: number, input: CreateReviewPayload): Review {
  return {
    id: -Date.now(),
    productId,
    reviewer: input.reviewer,
    reviewerEmail: input.reviewerEmail,
    review: input.review,
    rating: input.rating,
    verified: false,
    dateCreated: new Date().toISOString(),
  };
}

export function useCreateReview(productId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateReviewPayload) => {
      const body = toRequestBody(input);
      return createReview(body);
    },
    onMutate: async (input) => {
      const key = reviewQueryKey(productId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Review[]>(key);
      const next = [...(previous ?? []), optimisticReview(productId, input)];
      queryClient.setQueryData(key, next);
      return { previous } as { previous: Review[] | undefined };
    },
    onError: (_err, _input, context) => {
      queryClient.setQueryData(
        reviewQueryKey(productId),
        context?.previous ?? [],
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: reviewQueryKey(productId) });
    },
  });
}
