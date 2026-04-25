import type { AxiosInstance } from "axios";
import type { SessionJwtPayload } from "@/lib/jwt";
import { listWooOrdersForSession } from "@/lib/list-woo-orders-for-session";
import { wcLineItemMatchesPdpProductId } from "@/features/reviews/lib/line-matches-pdp";
import { wpOrderSchema, wpReviewsSchema } from "@/schemas/wordpress";
import type { z } from "zod";

export const REVIEW_ORDER_STATUS = "completed" as const;

export type ReviewEligibilityResult = {
  canReview: boolean;
  mustLogin: boolean;
  alreadyReviewed: boolean;
};

const normalizeEmail = (e: string) => e.trim().toLowerCase();

/**
 * لطلب ‎`completed`‎: هل سطرٌ فيه ‎`productId`‎ المطلوب (مع دعم المتغيرات).
 * يتوقع صف بيانات ‎Woo ‎(قبل/بعد ‎`wpOrderSchema.parse`‎)‎.
 */
export function orderRowContainsProductId(
  order: z.infer<typeof wpOrderSchema>,
  productId: number,
): boolean {
  for (const line of order.line_items) {
    if (
      wcLineItemMatchesPdpProductId(
        { product_id: line.product_id, variation_id: line.variation_id },
        productId,
      )
    ) {
      return true;
    }
  }
  return false;
}

export async function sessionHasCompletedPurchaseOfProduct(
  woo: AxiosInstance,
  session: SessionJwtPayload,
  productId: number,
): Promise<boolean> {
  const rows = await listWooOrdersForSession(woo, session, {
    status: REVIEW_ORDER_STATUS,
    per_page: "100",
    orderby: "date",
    order: "desc",
  });
  for (const row of rows) {
    const order = wpOrderSchema.parse(row);
    if (order.status === REVIEW_ORDER_STATUS && orderRowContainsProductId(order, productId)) {
      return true;
    }
  }
  return false;
}

export async function sessionHasExistingReviewOnProduct(
  woo: AxiosInstance,
  productId: number,
  email: string,
): Promise<boolean> {
  const want = normalizeEmail(email);
  const res = await woo.get("/products/reviews", {
    params: { product: String(productId), per_page: "100" },
  });
  const list = wpReviewsSchema.parse(res.data);
  return list.some((r) => normalizeEmail(r.reviewer_email) === want);
}

export async function getReviewEligibility(
  woo: AxiosInstance,
  session: SessionJwtPayload | null,
  productId: number,
): Promise<ReviewEligibilityResult> {
  if (!session) {
    return { canReview: false, mustLogin: true, alreadyReviewed: false };
  }

  const [purchased, already] = await Promise.all([
    sessionHasCompletedPurchaseOfProduct(woo, session, productId),
    sessionHasExistingReviewOnProduct(woo, productId, session.email),
  ]);

  if (already) {
    return { canReview: false, mustLogin: false, alreadyReviewed: true };
  }
  if (!purchased) {
    return { canReview: false, mustLogin: false, alreadyReviewed: false };
  }
  return { canReview: true, mustLogin: false, alreadyReviewed: false };
}
