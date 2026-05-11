import { isAxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { requireScopeFull } from "@/lib/api-control-auth";
import { hasControlPanelTab } from "@/lib/control-panel-tab";
import { createWooClient } from "@/lib/create-woo-client";
import { WOO_ENV_NOT_CONFIGURED_MESSAGE } from "@/lib/woo-env-errors";
import { wpProductsSchema } from "@/schemas/wordpress";
import type { WCProduct } from "@/features/products/types";

export const runtime = "nodejs";

type InventoryFilter = "all" | "noQuantity" | "outofstock" | "instock";

type InventoryProductRow = {
  id: number;
  name: string;
  sku: string;
  permalink: string;
  status: string;
  catalogVisibility: string;
  stockStatus: WCProduct["stock_status"];
  stockQuantity: number | null;
  manageStock: boolean;
  price: string;
  categories: { id: number; name: string; slug: string }[];
  needsAttention: boolean;
  attentionReason: "outofstock" | "zeroQuantity" | "missingQuantity" | null;
};

const WOO_PAGE_SIZE = 100;
const MAX_WOO_PAGES = 50;
const DEFAULT_PAGE_SIZE = 50;
const MAX_RESPONSE_PAGE_SIZE = 100;

function parsePositiveInt(raw: string | null, fallback: number, max: number): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(n, max);
}

function parseFilter(raw: string | null): InventoryFilter {
  if (raw === "noQuantity" || raw === "outofstock" || raw === "instock") {
    return raw;
  }
  return "all";
}

function isVisibleInStorefront(product: Pick<WCProduct, "status" | "catalog_visibility">): boolean {
  return product.status === "publish" && product.catalog_visibility !== "hidden";
}

function getAttentionReason(
  product: Pick<WCProduct, "manage_stock" | "stock_quantity" | "stock_status">,
): InventoryProductRow["attentionReason"] {
  if (product.stock_status === "outofstock") return "outofstock";
  if (!product.manage_stock) return null;
  if (product.stock_quantity == null) return "missingQuantity";
  if (product.stock_quantity <= 0) return "zeroQuantity";
  return null;
}

function toInventoryRow(product: WCProduct): InventoryProductRow {
  const attentionReason = getAttentionReason(product);
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    permalink: product.permalink,
    status: product.status,
    catalogVisibility: product.catalog_visibility,
    stockStatus: product.stock_status,
    stockQuantity: product.stock_quantity,
    manageStock: product.manage_stock,
    price: product.price,
    categories: product.categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    })),
    needsAttention: attentionReason != null,
    attentionReason,
  };
}

function rowMatchesFilter(row: InventoryProductRow, filter: InventoryFilter): boolean {
  switch (filter) {
    case "noQuantity":
      return row.attentionReason === "missingQuantity" || row.attentionReason === "zeroQuantity";
    case "outofstock":
      return row.stockStatus === "outofstock";
    case "instock":
      return row.stockStatus === "instock" && !row.needsAttention;
    default:
      return true;
  }
}

function summarize(rows: InventoryProductRow[]) {
  return {
    visible: rows.length,
    instock: rows.filter((row) => row.stockStatus === "instock" && !row.needsAttention).length,
    noQuantity: rows.filter(
      (row) => row.attentionReason === "missingQuantity" || row.attentionReason === "zeroQuantity",
    ).length,
    outofstock: rows.filter((row) => row.stockStatus === "outofstock").length,
  };
}

/**
 * GET: قائمة مختصرة لأرصدة المنتجات الظاهرة في WooCommerce داخل لوحة التحكم.
 */
export async function GET(request: NextRequest) {
  const auth = await requireScopeFull(request);
  if (auth instanceof NextResponse) return auth;
  if (!hasControlPanelTab(auth, "inventory")) {
    return NextResponse.json(
      { error: "ليس لديك صلاحية متابعة أرصدة المنتجات من هذا الحساب" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const page = parsePositiveInt(searchParams.get("page"), 1, 10_000);
  const perPage = parsePositiveInt(
    searchParams.get("per_page"),
    DEFAULT_PAGE_SIZE,
    MAX_RESPONSE_PAGE_SIZE,
  );
  const search = searchParams.get("search")?.trim() ?? "";
  const filter = parseFilter(searchParams.get("filter"));

  try {
    const woo = await createWooClient();
    const rows: InventoryProductRow[] = [];
    let wooPage = 1;
    let totalWooPages = 1;
    let truncated = false;

    while (wooPage <= totalWooPages && wooPage <= MAX_WOO_PAGES) {
      const response = await woo.get("/products", {
        params: {
          status: "publish",
          page: wooPage,
          per_page: WOO_PAGE_SIZE,
          ...(search ? { search } : {}),
        },
      });
      totalWooPages = Math.max(
        1,
        Number.parseInt(String(response.headers["x-wp-totalpages"] ?? "1"), 10) || 1,
      );

      const parsed = wpProductsSchema.parse(Array.isArray(response.data) ? response.data : []);
      for (const product of parsed) {
        if (!isVisibleInStorefront(product)) continue;
        rows.push(toInventoryRow(product));
      }
      wooPage++;
    }

    truncated = totalWooPages > MAX_WOO_PAGES;

    const summary = summarize(rows);
    const filteredRows = rows.filter((row) => rowMatchesFilter(row, filter));
    const total = filteredRows.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const start = (page - 1) * perPage;
    const pageRows = filteredRows.slice(start, start + perPage);

    return NextResponse.json({
      products: pageRows,
      summary,
      pagination: {
        page,
        perPage,
        total,
        totalPages,
      },
      filter,
      search,
      truncated,
    });
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
          error: "تعذر جلب أرصدة المنتجات من WooCommerce.",
          httpStatus: error.response?.status ?? null,
        },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: "تعذر تجهيز قائمة أرصدة المنتجات." },
      { status: 500 },
    );
  }
}
