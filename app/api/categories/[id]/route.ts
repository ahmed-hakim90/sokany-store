import { NextResponse } from "next/server";
import { createWooClient } from "@/lib/create-woo-client";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const woo = createWooClient();
    const response = await woo.get(`/products/categories/${id}`);
    return NextResponse.json(response.data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 },
    );
  }
}
