import "server-only";

import { isAxiosError } from "axios";
import { z } from "zod";
import { USE_MOCK } from "@/lib/constants";
import { createWooClient } from "@/lib/create-woo-client";
import { resolveWooBaseUrlForServer } from "@/lib/resolve-woo-base-url";
import { wpCategoriesSchema, wpProductsSchema } from "@/schemas/wordpress";

export async function isWooEnvConfigured(): Promise<boolean> {
  if (
    !process.env.WC_CONSUMER_KEY?.trim() ||
    !process.env.WC_CONSUMER_SECRET?.trim()
  ) {
    return false;
  }
  const base = await resolveWooBaseUrlForServer();
  return Boolean(base?.trim());
}

export async function getWcBaseUrlForDisplay(): Promise<string | null> {
  const raw = await resolveWooBaseUrlForServer();
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return raw;
  }
}

function zodReport(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.length ? issue.path.map(String).join(".") : "(root)",
    message: issue.message,
    code: issue.code,
  }));
}

export type ZodIssueRow = ReturnType<typeof zodReport>[number];

export type ProbeResult = {
  httpStatus: number | null;
  ok: boolean;
  source: "woo" | "error";
  sampleCount: number;
  schemaOk: boolean;
  zodErrors?: ReturnType<typeof zodReport>;
  error?: string;
  /** زمن ‎round-trip‎ لآخر فحص ‎(ms) — عند ‎Woo ‎بنجاح. */
  latencyMs?: number;
  /** عيّنة آمنة من أول سجل عند نجاح الـ schema */
  sample?: Record<string, string | number | boolean | null>;
};

function axiosProbeError(e: unknown): { httpStatus: number | null; message: string } {
  if (isAxiosError(e)) {
    const status = e.response?.status ?? null;
    const data = e.response?.data;
    const detail =
      typeof data === "string"
        ? data.slice(0, 200)
        : data != null && typeof data === "object" && "message" in data
          ? String((data as { message: unknown }).message)
          : e.message;
    return { httpStatus: status, message: detail.slice(0, 300) };
  }
  if (e instanceof Error) {
    return { httpStatus: null, message: e.message };
  }
  return { httpStatus: null, message: "Unknown error" };
}

function productSampleFromParsed(
  data: z.infer<typeof wpProductsSchema>,
): Record<string, string | number | boolean | null> | undefined {
  const p = data[0];
  if (!p) return undefined;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku || "—",
    price: p.price,
    status: p.status,
    type: p.type,
  };
}

function categorySampleFromParsed(
  data: z.infer<typeof wpCategoriesSchema>,
): Record<string, string | number | boolean | null> | undefined {
  const c = data[0];
  if (!c) return undefined;
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    count: c.count,
    parent: c.parent,
  };
}

export type WooDiagnosticReport = {
  at: string;
  useMock: boolean;
  wooEnvConfigured: boolean;
  wcBaseUrl: string | null;
  products: ProbeResult;
  categories: ProbeResult;
  /** مسارات الـ API في المشروع (للعرض فقط) */
  apiMap: { label: string; nextPath: string; remoteHint: string }[];
};

const API_MAP: WooDiagnosticReport["apiMap"] = [
  { label: "المنتجات", nextPath: "/api/products", remoteHint: "wc/v3/products" },
  { label: "منتج", nextPath: "/api/products/[id]", remoteHint: "wc/v3/products/{id}" },
  {
    label: "التصنيفات",
    nextPath: "/api/categories",
    remoteHint: "wc/v3/products/categories",
  },
  { label: "تتبع طلب", nextPath: "/api/orders/track", remoteHint: "wc/v3/orders" },
  {
    label: "الخط الساخن",
    nextPath: "/api/store/hotline",
    remoteHint: "wp … /sokany/v1/hotline",
  },
  {
    label: "Webhook (تحديثات)",
    nextPath: "POST /api/webhooks/woocommerce",
    remoteHint: "Woo يرسل → Next (إبطال كاش)",
  },
];

/**
 * تقرير تشخيص Woo (بدون مفاتيح). للاستخدام من الـ API route وصفحة التحكم.
 */
export async function getWooDiagnosticReport(): Promise<WooDiagnosticReport> {
  const at = new Date().toISOString();
  const wooConfigured = await isWooEnvConfigured();
  const base: WooDiagnosticReport = {
    at,
    useMock: USE_MOCK,
    wooEnvConfigured: wooConfigured,
    wcBaseUrl: await getWcBaseUrlForDisplay(),
    products: {
      httpStatus: null,
      ok: false,
      source: "error",
      sampleCount: 0,
      schemaOk: false,
    },
    categories: {
      httpStatus: null,
      ok: false,
      source: "error",
      sampleCount: 0,
      schemaOk: false,
    },
    apiMap: API_MAP,
  };

  if (!wooConfigured) {
    const msg =
      "Missing or empty WC_BASE_URL, WC_CONSUMER_KEY, and/or WC_CONSUMER_SECRET";
    base.products = {
      httpStatus: null,
      ok: false,
      source: "error",
      sampleCount: 0,
      schemaOk: false,
      error: msg,
    };
    base.categories = { ...base.categories, error: msg };
    return base;
  }

  let woo: Awaited<ReturnType<typeof createWooClient>>;
  try {
    woo = await createWooClient();
  } catch (e) {
    const { message } = axiosProbeError(e);
    const err = { error: message };
    base.products = { ...base.products, ...err };
    base.categories = { ...base.categories, ...err };
    return base;
  }

  try {
    const tProbe = Date.now();
    const res = await woo.get("/products", { params: { per_page: 1 } });
    const probeMs = Date.now() - tProbe;
    const data = res.data;
    const list = Array.isArray(data) ? data : [];
    const parsed = wpProductsSchema.safeParse(data);
    base.products = {
      httpStatus: res.status,
      ok: res.status >= 200 && res.status < 300,
      source: "woo",
      sampleCount: list.length,
      schemaOk: parsed.success,
      zodErrors: parsed.success ? undefined : zodReport(parsed.error),
      sample: parsed.success ? productSampleFromParsed(parsed.data) : undefined,
      latencyMs: probeMs,
    };
  } catch (e) {
    const { httpStatus, message } = axiosProbeError(e);
    base.products = {
      httpStatus,
      ok: false,
      source: "woo",
      sampleCount: 0,
      schemaOk: false,
      error: message,
    };
  }

  try {
    const tProbe = Date.now();
    const res = await woo.get("/products/categories", {
      params: { per_page: 1 },
    });
    const probeMs = Date.now() - tProbe;
    const data = res.data;
    const list = Array.isArray(data) ? data : [];
    const parsed = wpCategoriesSchema.safeParse(data);
    base.categories = {
      httpStatus: res.status,
      ok: res.status >= 200 && res.status < 300,
      source: "woo",
      sampleCount: list.length,
      schemaOk: parsed.success,
      zodErrors: parsed.success ? undefined : zodReport(parsed.error),
      sample: parsed.success ? categorySampleFromParsed(parsed.data) : undefined,
      latencyMs: probeMs,
    };
  } catch (e) {
    const { httpStatus, message } = axiosProbeError(e);
    base.categories = {
      httpStatus,
      ok: false,
      source: "woo",
      sampleCount: 0,
      schemaOk: false,
      error: message,
    };
  }

  return base;
}
