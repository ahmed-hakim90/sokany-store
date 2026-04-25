import { NextResponse } from "next/server";
import { mockProducts } from "@/features/products/mock";
import { getSnapshotProducts } from "@/features/data-snapshot/server";
import { createWooClient } from "@/lib/create-woo-client";
import { USE_MOCK } from "@/lib/constants";
import { wooBff502Response } from "@/lib/woo-bff-catch-payload";
import { isWcProductOutOfStockOnly } from "@/lib/woo-storefront-availability";
import type { WCProduct } from "@/features/products/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const woo = await createWooClient();
    const response = await woo.get(`/products/${id}`);
    const body = response.data as WCProduct;
    if (isWcProductOutOfStockOnly(body)) {
      return NextResponse.json({ error: "Product not available" }, { status: 404 });
    }
    return NextResponse.json(body);
  } catch (error) {
    if (!USE_MOCK) {
      return await wooBff502Response(error);
    }
    const fallbackProducts = getSnapshotProducts() ?? mockProducts;
    const raw = fallbackProducts.find((p) => String(p.id) === id);
    if (!raw) {
      return NextResponse.json(
        { error: "Failed to fetch product" },
        { status: 404 },
      );
    }
    if (isWcProductOutOfStockOnly(raw)) {
      return NextResponse.json(
        { error: "Product not available" },
        { status: 404 },
      );
    }
    return NextResponse.json(raw);
  }
}
