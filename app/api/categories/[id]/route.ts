import { NextResponse } from "next/server";
import { mockCategories } from "@/features/categories/mock";
import { getSnapshotCategories } from "@/features/data-snapshot/server";
import { createWooClient } from "@/lib/create-woo-client";
import { USE_MOCK } from "@/lib/constants";
import { wooBff502Response } from "@/lib/woo-bff-catch-payload";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const woo = await createWooClient();
    const response = await woo.get(`/products/categories/${id}`);
    return NextResponse.json(response.data);
  } catch (error) {
    if (!USE_MOCK) {
      return await wooBff502Response(error);
    }
    const source = getSnapshotCategories() ?? mockCategories;
    const raw = source.find((c) => String(c.id) === id);
    if (!raw) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json(raw);
  }
}
