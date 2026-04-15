import { NextRequest, NextResponse } from "next/server";
import { createWooClient } from "@/lib/create-woo-client";
import { getSessionFromRequest } from "@/lib/auth-request";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const woo = createWooClient();
    const params = Object.fromEntries(searchParams.entries());
    const response = await woo.get("/products/reviews", { params });
    return NextResponse.json(response.data, {
      headers: {
        "X-WP-Total": String(response.headers["x-wp-total"] ?? "0"),
        "X-WP-TotalPages": String(response.headers["x-wp-totalpages"] ?? "1"),
      },
    });
  } catch {
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
  } catch {
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 },
    );
  }
}
