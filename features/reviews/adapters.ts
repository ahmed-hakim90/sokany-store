import { stripHtml } from "@/lib/utils";
import type { Review, WCReview } from "@/features/reviews/types";

export function mapReview(raw: WCReview): Review {
  return {
    id: raw.id,
    productId: raw.product_id,
    reviewer: raw.reviewer,
    reviewerEmail: raw.reviewer_email,
    review: stripHtml(raw.review),
    rating: raw.rating,
    verified: raw.verified,
    dateCreated: raw.date_created,
  };
}

export function mapReviews(list: WCReview[]): Review[] {
  return list.map(mapReview);
}
