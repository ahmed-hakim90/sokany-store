import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { createWooClient } from "@/lib/create-woo-client";
import { getSessionFromRequest } from "@/lib/auth-request";
import { getReviewEligibility } from "@/lib/review-purchase-eligibility";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("product_id");
  const productId = raw == null || raw === "" ? Number.NaN : Number(raw);
  if (!Number.isFinite(productId) || productId < 1) {
    return NextResponse.json(
      { error: "Valid product_id is required" },
      { status: 400 },
    );
  }
  const session = await getSessionFromRequest(request);
  try {
    const woo = await createWooClient();
    const body = await getReviewEligibility(woo, session, productId);
    return NextResponse.json(body);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[api/reviews/eligibility] GET", error);
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
          : { error: "Failed to check eligibility" },
        { status: error.response.status },
      );
    }
    return NextResponse.json(
      { error: "Failed to check eligibility" },
      { status: 500 },
    );
  }
}
