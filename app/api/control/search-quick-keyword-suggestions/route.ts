import { NextRequest, NextResponse } from "next/server";
import { fetchCachedWooProductTagsByProductCount } from "@/features/control/services/fetchCachedWooProductTagsByProductCount";
import { requireScopeFull } from "@/lib/api-control-auth";
import { WOO_ENV_NOT_CONFIGURED_MESSAGE } from "@/lib/woo-env-errors";

export const runtime = "nodejs";

/**
 * اقتراحات كلمات البحث السريعة من وسوم Woo (عدد المنتجات لكل وسم) — لوحة التحكم فقط.
 */
export async function GET(request: NextRequest) {
  const auth = await requireScopeFull(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const tags = await fetchCachedWooProductTagsByProductCount();
    return NextResponse.json({ tags });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes(WOO_ENV_NOT_CONFIGURED_MESSAGE)) {
      return NextResponse.json(
        {
          error:
            "ربط WooCommerce غير مكتمل على الخادم (متغيرات البيئة). راجع تبويب ربط المتجر.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "تعذر جلب وسوم المنتجات من WooCommerce." },
      { status: 502 },
    );
  }
}
