/**
 * BFF: تصنيفات المنتجات
 * بالعامية: كاش مشترك مع `fetchCachedWooCategories`؛ لو Woo مش متاح نرجع من سنابشوت/موك مع فلترة slug اختيارية.
 */
import { NextRequest, NextResponse } from "next/server";
import { mockCategories } from "@/features/categories/mock";
import { fetchCachedWooCategories } from "@/features/categories/services/fetchCachedWooCategories";
import { getSnapshotCategories } from "@/features/data-snapshot/server";
import { wooBff502Response } from "@/lib/woo-bff-catch-payload";
import { shouldUseWooBffMockFallback } from "@/lib/woo-bff-mock-fallback";
import { API_NO_INDEX_HEADERS } from "@/lib/api-no-index";
import { enforceCatalogReadRateLimit } from "@/lib/public-api-rate-limit";

export async function GET(request: NextRequest) {
  const limited = enforceCatalogReadRateLimit(request);
  if (limited) return limited;

  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const cached = await fetchCachedWooCategories(JSON.stringify(params));
    return NextResponse.json(cached.data, {
      headers: {
        "X-WP-Total": cached.total,
        "X-WP-TotalPages": cached.totalPages,
        ...API_NO_INDEX_HEADERS,
      },
    });
  } catch (error) {
    if (!shouldUseWooBffMockFallback(error)) {
      return await wooBff502Response(error);
    }
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
        ...API_NO_INDEX_HEADERS,
      },
    });
  }
}
