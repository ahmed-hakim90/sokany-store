/**
 * جلب صفحة منتجات «زي ما المتجر شايفها»
 * بالعامية: Woo بيرجع أحياناً حاجات out-of-stock؛ إحنا بنمشي على صفحات API ونفلتر ونكمّل لحد ما نملى `per_page` — ده مكلف شوية بس يضمن كتالوج نظيف.
 *
 * ملاحظات:
 * - `orderby=rand` حالة خاصة: مينفعش pagination عادي، بنجيب دفعة كبيرة مرة واحدة.
 * - في dev شغّل `WOO_STOREFRONT_WALK_LOG=true` لو عايز تشوف عدد اللفات والوقت.
 * - شوف كمان: `@/lib/woo-storefront-availability.ts`، `@/app/api/products/route.ts`
 */
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

/** حجم دفعة داخلية — Woo عادة بيسمح لحد ١٠٠. */
const INNER_PER_PAGE_MAX = 100;
/** سقف لفات الجلب علشان ما نقعش في loop لو الدنيا كلها out of stock. */
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

  /** rand = ترتيب عشوائي كل مرة — مينفعش نكمل صفحات؛ بنسحب دفعة ونشرّح محلياً. */
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

  const walkLog = process.env.WOO_STOREFRONT_WALK_LOG === "true";
  const walkT0 = walkLog ? Date.now() : 0;

  let skipRemaining = targetSkip;
  const collected: WCProduct[] = [];
  let queue: WCProduct[] = [];
  let wooPage = 1;
  let iterations = 0;
  let lastTotal = "0";
  let lastTotalPages = "1";

  while (collected.length < targetTake && iterations < STORE_WALK_MAX_ITERATIONS) {
    iterations += 1;

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

  if (walkLog && process.env.NODE_ENV === "development") {
    const ms = Date.now() - walkT0;
    console.warn(
      "[woo-storefront-walk]",
      JSON.stringify({
        ms,
        iterations,
        targetPage: page,
        perPage,
        collected: collected.length,
      }),
    );
  }

  return {
    data: collected.slice(0, targetTake),
    total: lastTotal,
    totalPages: lastTotalPages,
  };
}
