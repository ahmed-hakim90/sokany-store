import { NextRequest, NextResponse } from "next/server";
import { createWooClient } from "@/lib/create-woo-client";
import { getSessionFromRequest } from "@/lib/auth-request";
import { listWooOrdersForSession } from "@/lib/list-woo-orders-for-session";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const woo = await createWooClient();
    const params = Object.fromEntries(searchParams.entries());
    const data = await listWooOrdersForSession(woo, session, params);
    return NextResponse.json(data, {
      headers: {
        "X-WP-Total": String(data.length),
        "X-WP-TotalPages": "1",
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
    const woo = await createWooClient();
    const response = await woo.post("/orders", body);
    return NextResponse.json(response.data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
