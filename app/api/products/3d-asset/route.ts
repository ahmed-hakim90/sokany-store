import { NextRequest, NextResponse } from "next/server";
import { getProduct3DModelBySku } from "@/features/products/services/product-3d-assets";
import { normalizeProductSku } from "@/lib/product-3d-map";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const sku = normalizeProductSku(request.nextUrl.searchParams.get("sku"));
  if (!sku) {
    return NextResponse.json({ model: null });
  }

  const model = await getProduct3DModelBySku(sku);
  return NextResponse.json({ model });
}
