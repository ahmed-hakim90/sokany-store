import { apiClient } from "@/lib/api";
import { USE_MOCK } from "@/lib/constants";
import { mapReviews } from "@/features/reviews/adapters";
import { mockReviews } from "@/features/reviews/mock";
import { wpReviewsSchema } from "@/schemas/wordpress";
import type { Review } from "@/features/reviews/types";

function parseWpTotalPagesHeader(
  v: string | number | boolean | undefined,
): number | null {
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) && n >= 1 ? n : null;
}

const REVIEWS_PER_PAGE = 100;
/** حماية من حلقة غير متوقعة عند بيانات خاطئة من الخادم. */
const MAX_REVIEW_PAGES = 30;

/**
 * يجلب كل تقييمات المنتج من Woo عبر `/api/reviews` (عدة صفحات إن لزم).
 * بدون `per_page` كان Woo يعيد الصفحة الأولى فقط (غالباً 10).
 */
export async function getReviews(productId: number): Promise<Review[]> {
  if (USE_MOCK) {
    return mapReviews(
      wpReviewsSchema.parse(
        mockReviews.filter((review) => review.product_id === productId),
      ),
    );
  }

  const all: Review[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && page <= MAX_REVIEW_PAGES) {
    const response = await apiClient.get("/reviews", {
      params: {
        product_id: productId,
        per_page: REVIEWS_PER_PAGE,
        page,
      },
    });
    const chunk = mapReviews(wpReviewsSchema.parse(response.data));
    all.push(...chunk);

    const h = response.headers;
    const fromHeader = parseWpTotalPagesHeader(
      h["x-wp-totalpages"] ?? h["X-WP-TotalPages"],
    );
    if (fromHeader != null) {
      totalPages = fromHeader;
    } else {
      totalPages = chunk.length < REVIEWS_PER_PAGE ? page : page + 1;
    }

    if (chunk.length === 0) {
      break;
    }
    page += 1;
  }

  return all;
}
