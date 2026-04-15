export type Review = {
  id: number;
  productId: number;
  reviewer: string;
  reviewerEmail: string;
  review: string;
  rating: number;
  verified: boolean;
  dateCreated: string;
};

export type CreateReviewPayload = {
  productId: number;
  review: string;
  reviewer: string;
  reviewerEmail: string;
  rating: number;
};

export type WCReview = {
  id: number;
  product_id: number;
  status: string;
  reviewer: string;
  reviewer_email: string;
  review: string;
  rating: number;
  verified: boolean;
  date_created: string;
};
