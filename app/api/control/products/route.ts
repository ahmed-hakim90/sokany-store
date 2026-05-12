import { isAxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { requireScopeFull } from "@/lib/api-control-auth";
import { hasControlPanelTab } from "@/lib/control-panel-tab";
import { createWooClient } from "@/lib/create-woo-client";
import { WOO_ENV_NOT_CONFIGURED_MESSAGE } from "@/lib/woo-env-errors";
import { wpProductSchema, wpProductsSchema } from "@/schemas/wordpress";
import type { WCProduct } from "@/features/products/types";

export const runtime = "nodejs";

type ControlProductSearchRow = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: string;
  permalink: string;
  imageUrl: string;
};

function toSearchRow(product: WCProduct): ControlProductSearchRow {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    price: product.price,
    permalink: product.permalink,
    imageUrl: product.images[0]?.src ?? "",
  };
}

function isVisibleInStorefront(product: Pick<WCProduct, "status" | "catalog_visibility">) {
  return product.status === "publish" && product.catalog_visibility !== "hidden";
}

export async function GET(request: NextRequest) {
  const auth = await requireScopeFull(request);
  if (auth instanceof NextResponse) return auth;
  if (!hasControlPanelTab(auth, "landing")) {
    return NextResponse.json(
      { error: "ليس لديك صلاحية إعداد صفحة هبوط المنتج من هذا الحساب" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const perPageRaw = Number.parseInt(searchParams.get("per_page") ?? "8", 10);
  const perPage = Number.isFinite(perPageRaw) ? Math.min(Math.max(perPageRaw, 1), 20) : 8;
  if (!search) return NextResponse.json({ products: [] });

  try {
    const woo = await createWooClient();
    const byIdRows: WCProduct[] = [];

    if (/^\d+$/.test(search)) {
      const byId = await woo
        .get(`/products/${Number.parseInt(search, 10)}`)
        .then((response) => wpProductSchema.parse(response.data))
        .catch(() => null);
      if (byId && isVisibleInStorefront(byId)) byIdRows.push(byId);
    }

    const response = await woo.get("/products", {
      params: {
        status: "publish",
        search,
        per_page: perPage,
      },
    });
    const searched = wpProductsSchema
      .parse(Array.isArray(response.data) ? response.data : [])
      .filter(isVisibleInStorefront);

    const seen = new Set<number>();
    const products = [...byIdRows, ...searched]
      .filter((product) => {
        if (seen.has(product.id)) return false;
        seen.add(product.id);
        return true;
      })
      .slice(0, perPage)
      .map(toSearchRow);

    return NextResponse.json({ products });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes(WOO_ENV_NOT_CONFIGURED_MESSAGE)) {
      return NextResponse.json(
        {
          error:
            "ربط WooCommerce غير مكتمل على الخادم (متغيرات البيئة). راجع تبويب ربط المتجر.",
        },
        { status: 503 },
      );
    }
    if (isAxiosError(error)) {
      return NextResponse.json(
        {
          error: "تعذر البحث في منتجات WooCommerce.",
          httpStatus: error.response?.status ?? null,
        },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: "تعذر تجهيز نتائج البحث عن المنتجات." },
      { status: 500 },
    );
  }
}
