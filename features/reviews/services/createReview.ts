import type { z } from "zod";
import { apiClient } from "@/lib/api";
import { mapReview } from "@/features/reviews/adapters";
import { createReviewPayloadSchema, wpReviewSchema } from "@/schemas/wordpress";
import type { Review } from "@/features/reviews/types";

export type CreateReviewRequestBody = z.infer<typeof createReviewPayloadSchema>;

/** Sends a body already validated with `createReviewPayloadSchema`. */
export async function createReview(
  requestBody: CreateReviewRequestBody,
): Promise<Review> {
  const response = await apiClient.post("/reviews", requestBody);
  return mapReview(wpReviewSchema.parse(response.data));
}
