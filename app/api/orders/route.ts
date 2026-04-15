import { NextRequest, NextResponse } from "next/server";
import { createWooClient } from "@/lib/create-woo-client";
import { getSessionFromRequest } from "@/lib/auth-request";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const woo = createWooClient();
    const customers = await woo.get("/customers", {
      params: { email: session.email, per_page: 1 },
    });
    const customerId = Array.isArray(customers.data)
      ? (customers.data as { id: number }[])[0]?.id
      : undefined;
    if (!customerId) {
      return NextResponse.json([], { status: 200 });
    }
    const params = Object.fromEntries(searchParams.entries());
    const response = await woo.get("/orders", {
      params: { ...params, customer: customerId },
    });
    return NextResponse.json(response.data, {
      headers: {
        "X-WP-Total": String(response.headers["x-wp-total"] ?? "0"),
        "X-WP-TotalPages": String(response.headers["x-wp-totalpages"] ?? "1"),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const woo = createWooClient();
    const response = await woo.post("/orders", body);
    return NextResponse.json(response.data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
