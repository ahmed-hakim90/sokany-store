import { NextResponse } from "next/server";
import { mockProducts } from "@/features/products/mock";
import { getSnapshotProducts } from "@/features/data-snapshot/server";
import { createWooClient } from "@/lib/create-woo-client";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const woo = createWooClient();
    const response = await woo.get(`/products/${id}`);
    return NextResponse.json(response.data);
  } catch {
    const fallbackProducts = getSnapshotProducts() ?? mockProducts;
    const raw = fallbackProducts.find((p) => String(p.id) === id);
    if (!raw) {
      return NextResponse.json(
        { error: "Failed to fetch product" },
        { status: 404 },
      );
    }
    return NextResponse.json(raw);
  }
}
