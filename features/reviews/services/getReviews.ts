import { apiClient } from "@/lib/api";
import { USE_MOCK } from "@/lib/constants";
import { mapReviews } from "@/features/reviews/adapters";
import { mockReviews } from "@/features/reviews/mock";
import { wpReviewsSchema } from "@/schemas/wordpress";
import type { Review } from "@/features/reviews/types";

export async function getReviews(productId: number): Promise<Review[]> {
  if (USE_MOCK) {
    return mapReviews(
      wpReviewsSchema.parse(
        mockReviews.filter((review) => review.product_id === productId),
      ),
    );
  }
  const response = await apiClient.get("/reviews", {
    params: { product_id: productId },
  });
  return mapReviews(wpReviewsSchema.parse(response.data));
}
