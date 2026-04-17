import { NextRequest, NextResponse } from "next/server";
import { mockCategories } from "@/features/categories/mock";
import { createWooClient } from "@/lib/create-woo-client";
import { getSnapshotCategories } from "@/features/data-snapshot/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const woo = createWooClient();
    const params = Object.fromEntries(searchParams.entries());
    const response = await woo.get("/products/categories", { params });
    return NextResponse.json(response.data, {
      headers: {
        "X-WP-Total": String(response.headers["x-wp-total"] ?? "0"),
        "X-WP-TotalPages": String(response.headers["x-wp-totalpages"] ?? "1"),
      },
    });
  } catch {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const sourceCategories = getSnapshotCategories() ?? mockCategories;
    const data = slug
      ? sourceCategories.filter((c) => c.slug === slug)
      : sourceCategories;
    return NextResponse.json(data, {
      headers: {
        "X-WP-Total": String(data.length),
        "X-WP-TotalPages": "1",
      },
    });
  }
}
