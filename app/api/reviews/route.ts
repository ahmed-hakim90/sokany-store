import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { unstable_cache } from "next/cache";
import { createWooClient } from "@/lib/create-woo-client";
import { getSessionFromRequest } from "@/lib/auth-request";
import { createReviewPayloadSchema } from "@/schemas/wordpress";
import { getReviewEligibility } from "@/lib/review-purchase-eligibility";
import { WOO_CACHE_TAG_REVIEWS } from "@/lib/woocommerce-cache-tags";
import { revalidateWooReviewTags } from "@/lib/woocommerce-revalidate-broadcast";

type CachedWooListResponse = {
  data: unknown;
  total: string;
  totalPages: string;
};

/** Map storefront query params to WooCommerce REST `/products/reviews` (list uses `product`, not `product_id`). */
function toWooReviewListParams(
  searchParams: URLSearchParams,
): Record<string, string> {
  const params: Record<string, string> = Object.fromEntries(
    searchParams.entries(),
  );
  const productId = params.product_id;
  if (productId !== undefined) {
    delete params.product_id;
    params.product = productId;
  }
  return params;
}

const fetchWooReviewsCached = unstable_cache(
  async (paramsKey: string): Promise<CachedWooListResponse> => {
    const woo = await createWooClient();
    const params = JSON.parse(paramsKey) as Record<string, string>;
    const response = await woo.get("/products/reviews", { params });
    return {
      data: response.data,
      total: String(response.headers["x-wp-total"] ?? "0"),
      totalPages: String(response.headers["x-wp-totalpages"] ?? "1"),
    };
  },
  ["woo-api-reviews-v1"],
  { revalidate: 300, tags: [WOO_CACHE_TAG_REVIEWS] },
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = toWooReviewListParams(searchParams);
    const cached = await fetchWooReviewsCached(JSON.stringify(params));
    return NextResponse.json(cached.data, {
      headers: {
        "X-WP-Total": cached.total,
        "X-WP-TotalPages": cached.totalPages,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[api/reviews] GET", error);
    }
    if (
      error instanceof Error &&
      error.message.includes("WooCommerce server environment")
    ) {
      return NextResponse.json(
        { error: "WooCommerce is not configured on the server" },
        { status: 503 },
      );
    }
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        typeof error.response.data === "object" && error.response.data !== null
          ? error.response.data
          : { error: "Failed to fetch reviews" },
        { status: error.response.status },
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let parsed: ReturnType<typeof createReviewPayloadSchema.parse>;
  try {
    const raw: unknown = await request.json();
    parsed = createReviewPayloadSchema.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  try {
    const woo = await createWooClient();
    const eligibility = await getReviewEligibility(woo, session, parsed.product_id);
    if (!eligibility.canReview) {
      return NextResponse.json(
        {
          error: "REVIEW_NOT_ELIGIBLE",
          mustLogin: eligibility.mustLogin,
          alreadyReviewed: eligibility.alreadyReviewed,
        },
        { status: 403 },
      );
    }
    const displayName = session.displayName?.trim() || session.nicename;
    const secured = {
      product_id: parsed.product_id,
      review: parsed.review,
      rating: parsed.rating,
      reviewer: displayName,
      reviewer_email: session.email.trim().toLowerCase(),
    };
    const response = await woo.post("/products/reviews", secured);
    revalidateWooReviewTags();
    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[api/reviews] POST", error);
    }
    if (
      error instanceof Error &&
      error.message.includes("WooCommerce server environment")
    ) {
      return NextResponse.json(
        { error: "WooCommerce is not configured on the server" },
        { status: 503 },
      );
    }
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        typeof error.response.data === "object" && error.response.data !== null
          ? error.response.data
          : { error: "Failed to create review" },
        { status: error.response.status },
      );
    }
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 },
    );
  }
}
