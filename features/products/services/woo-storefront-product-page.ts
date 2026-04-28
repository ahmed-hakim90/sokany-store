import type { AxiosInstance } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/constants";
import { filterWcProductsExcludingOutOfStock } from "@/lib/woo-storefront-availability";
import type { WCProduct } from "@/features/products/types";
import type { ProductQueryParams } from "@/types";

export function productQueryParamsToRecord(
  params?: ProductQueryParams,
): Record<string, string> {
  if (!params) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    out[k] = typeof v === "boolean" ? (v ? "true" : "false") : String(v);
  }
  return out;
}

/** حجم دفعة Woo الداخلية — يُحدّ أقصى حجم شائع في Woo كـ 100. */
const INNER_PER_PAGE_MAX = 100;
/** أقصى عدد طلبات Woo لكل طلب متجر (حماية من حلقات طويلة عند كثرة غير المتوفّر). */
const STORE_WALK_MAX_ITERATIONS = 80;

function stripPageParams(params: Record<string, string>): Record<string, string> {
  const rest = { ...params };
  delete rest.page;
  delete rest.per_page;
  return rest;
}

export type WooStorefrontProductPageResult = {
  data: WCProduct[];
  /** من Woo (يشمل غالباً منتجات غير متوفّرة في العدّ؛ الترقيم تقريبي بعد التصفية). */
  total: string;
  totalPages: string;
};

/**
 * يجلب صفحة منتجات للمتجر مع احترام ترتيب Woo، مستبعداً ‎`outofstock`‎ من النتيجة
 * بحيث يكون طول الصفحة حتى ‎`per_page`‎ من العناصر «الظاهرة» في المتجر (متوفّر أو طلب مسبق).
 *
 * لا يعتمد على ‎`stock_status`‎ في Woo لأن ‎`/wc/v3/products`‎ يقيّد قيمة واحدة وتستبعد ‎`onbackorder`‎ إن ضُبطت إلى ‎`instock`‎ فقط.
 */
export async function fetchWooStorefrontProductsPage(
  woo: AxiosInstance,
  params: Record<string, string>,
): Promise<WooStorefrontProductPageResult> {
  const includeRaw = params.include?.trim();
  if (includeRaw) {
    const response = await woo.get("/products", { params });
    const payload = response.data;
    const arr = Array.isArray(payload)
      ? filterWcProductsExcludingOutOfStock(payload as WCProduct[])
      : [];
    return {
      data: arr,
      total: String(response.headers["x-wp-total"] ?? arr.length),
      totalPages: String(response.headers["x-wp-totalpages"] ?? "1"),
    };
  }

  const perPage = Math.min(
    INNER_PER_PAGE_MAX,
    Math.max(1, Number(params.per_page ?? String(DEFAULT_PER_PAGE)) || DEFAULT_PER_PAGE),
  );
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const targetSkip = (page - 1) * perPage;
  const targetTake = perPage;

  const filterBase = stripPageParams(params);

  /** مع ‎`orderby=rand`‎ لا يمكن الجمع بين صفحات Woo متتابعة (كل طلب ترتيب مختلف). جلب دفعة واحدة كبيرة ثم التصفية والشرائح. */
  if (filterBase.orderby === "rand") {
    const fetchSize = Math.min(
      INNER_PER_PAGE_MAX,
      Math.max(targetSkip + targetTake + 40, 60),
    );
    const innerRandParams: Record<string, string> = {
      ...filterBase,
      page: "1",
      per_page: String(fetchSize),
      orderby: "rand",
    };
    delete innerRandParams.order;

    const response = await woo.get("/products", { params: innerRandParams });
    const raw = response.data as WCProduct[];
    const filtered = filterWcProductsExcludingOutOfStock(
      Array.isArray(raw) ? raw : [],
    );
    const pageSlice = filtered.slice(targetSkip, targetSkip + targetTake);
    return {
      data: pageSlice,
      total: String(Math.max(pageSlice.length, 0)),
      totalPages: "1",
    };
  }

  const innerPerPage = Math.min(
    INNER_PER_PAGE_MAX,
    Math.max(perPage * 2, 40),
  );

  let skipRemaining = targetSkip;
  const collected: WCProduct[] = [];
  let queue: WCProduct[] = [];
  let wooPage = 1;
  let iterations = 0;
  let lastTotal = "0";
  let lastTotalPages = "1";

  while (collected.length < targetTake && iterations < STORE_WALK_MAX_ITERATIONS) {
    iterations++;

    if (queue.length === 0) {
      const innerParams: Record<string, string> = {
        ...filterBase,
        page: String(wooPage),
        per_page: String(innerPerPage),
      };
      const response = await woo.get("/products", { params: innerParams });
      lastTotal = String(response.headers["x-wp-total"] ?? "0");
      lastTotalPages = String(response.headers["x-wp-totalpages"] ?? "1");

      const raw = response.data as WCProduct[];
      if (!Array.isArray(raw) || raw.length === 0) break;

      queue = filterWcProductsExcludingOutOfStock(raw);
      wooPage++;
    }

    while (queue.length > 0 && skipRemaining > 0) {
      queue.shift();
      skipRemaining--;
    }

    while (queue.length > 0 && collected.length < targetTake) {
      const next = queue.shift();
      if (next) collected.push(next);
    }
  }

  return {
    data: collected.slice(0, targetTake),
    total: lastTotal,
    totalPages: lastTotalPages,
  };
}
