import { apiClient } from "@/lib/api";
import { reviewEligibilityResponseSchema } from "@/schemas/wordpress";
import type { z } from "zod";

export type ReviewEligibility = z.infer<typeof reviewEligibilityResponseSchema>;

export async function fetchReviewEligibility(
  productId: number,
): Promise<ReviewEligibility> {
  const res = await apiClient.get("/reviews/eligibility", {
    params: { product_id: productId },
  });
  return reviewEligibilityResponseSchema.parse(res.data);
}
