import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { createWooClient } from "@/lib/create-woo-client";
import { getSessionFromRequest } from "@/lib/auth-request";

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const woo = createWooClient();
    const params = toWooReviewListParams(searchParams);
    const response = await woo.get("/products/reviews", { params });
    return NextResponse.json(response.data, {
      headers: {
        "X-WP-Total": String(response.headers["x-wp-total"] ?? "0"),
        "X-WP-TotalPages": String(response.headers["x-wp-totalpages"] ?? "1"),
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
  try {
    const body: unknown = await request.json();
    const woo = createWooClient();
    const response = await woo.post("/products/reviews", body);
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
