import { NextRequest, NextResponse } from "next/server";
import {
  filterMockProducts,
  listMockProductsMatching,
} from "@/features/products/mock";
import { createWooClient } from "@/lib/create-woo-client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const woo = createWooClient();
    const params = Object.fromEntries(searchParams.entries());
    const response = await woo.get("/products", { params });
    return NextResponse.json(response.data, {
      headers: {
        "X-WP-Total": String(response.headers["x-wp-total"] ?? "0"),
        "X-WP-TotalPages": String(response.headers["x-wp-totalpages"] ?? "1"),
      },
    });
  } catch {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? "1") || 1;
    const per_page = Number(searchParams.get("per_page") ?? "12") || 12;
    const featured =
      searchParams.get("featured") === "true" ? true : undefined;
    const search = searchParams.get("search")?.trim() || undefined;
    const catRaw = searchParams.get("category");
    let category: string | number | undefined;
    if (catRaw) {
      const asNum = Number.parseInt(catRaw, 10);
      category = Number.isFinite(asNum) ? asNum : catRaw;
    }
    const filterOpts = { category, featured, search };
    const all = listMockProductsMatching(filterOpts);
    const data = filterMockProducts({
      ...filterOpts,
      page,
      per_page,
    });
    return NextResponse.json(data, {
      headers: {
        "X-WP-Total": String(all.length),
        "X-WP-TotalPages": String(
          Math.max(1, Math.ceil(all.length / per_page)),
        ),
      },
    });
  }
}
