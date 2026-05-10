import "server-only";

/**
 * ردود 502 من BFF لما Woo يقع
 * بالعامية: بنبني JSON موحّد للفرونت، وفي التطوير بنحط تلميحات تشخيص من غير ما نسرب مفاتيح API.
 *
 * ملاحظات:
 * - ليه `NextResponse.json` هنا: مسارات `/api` ترجع شكل متوقع للعميل حتى لو الـ upstream مات.
 * - حذر: الـ `dev` object يظهر بس في development.
 * - شوف كمان: `@/lib/woo-bff-errors.ts`، `@/app/api/products/route.ts`
 */
import { isAxiosError } from "axios";
import { NextResponse } from "next/server";
import { getCmsStorefrontIntegrationsForServer } from "@/features/cms/services/getCmsStorefrontIntegrationsForServer";
import { WOO_BFF_UNAVAILABLE } from "@/lib/woo-bff-errors";
import { resolveWooBaseUrlForServer } from "@/lib/resolve-woo-base-url";

function safeWooLogLine(error: unknown): Record<string, unknown> {
  if (!isAxiosError(error)) {
    const code =
      error instanceof Error && "code" in error && typeof (error as { code?: unknown }).code === "string"
        ? (error as { code: string }).code
        : undefined;
    return {
      message: error instanceof Error ? error.message : String(error),
      ...(code ? { code } : {}),
    };
  }
  const d = error.response?.data;
  let wooMessage: string | undefined;
  let wooCode: string | undefined;
  if (d && typeof d === "object" && d !== null) {
    if ("message" in d && typeof (d as { message?: unknown }).message === "string") {
      wooMessage = (d as { message: string }).message;
    }
    if ("code" in d && typeof (d as { code?: unknown }).code === "string") {
      wooCode = (d as { code: string }).code;
    }
  }
  return {
    message: error.message,
    /** Node/axios syscall (e.g. ECONNRESET) — often set when `message` is empty. */
    axiosCode: error.code,
    upstreamStatus: error.response?.status,
    requestUrl: [error.config?.baseURL, error.config?.url].filter(Boolean).join(""),
    wooCode,
    wooMessage,
  };
}

/** لوج آمن: من غير Authorization علشان المفاتيح ما تطلعش في الـ logs. */
function logWooBffFailure(error: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.error("[woo-bff] WooCommerce request failed", safeWooLogLine(error));
    return;
  }
  if (isAxiosError(error)) {
    const st = error.response?.status;
    if (st != null) {
      console.error(
        "[woo-bff] 502 upstream",
        st,
        error.config?.url ?? error.config?.baseURL ?? "",
      );
    } else {
      console.error("[woo-bff] 502", error.code, error.message);
    }
  } else if (error instanceof Error) {
    console.error("[woo-bff] 502", error.message);
  } else {
    console.error("[woo-bff] 502", String(error));
  }
}

/** جسم الـ 502؛ في dev بيزود تفاصيل تشخيصية. */
export async function buildWooBff502Body(
  error: unknown,
): Promise<Record<string, unknown>> {
  const body: Record<string, unknown> = { ...WOO_BFF_UNAVAILABLE };
  if (process.env.NODE_ENV !== "development") {
    return body;
  }
  const base = await resolveWooBaseUrlForServer();
  const int = await getCmsStorefrontIntegrationsForServer();
  let resolvedWooOrigin: string | null = null;
  if (base) {
    try {
      resolvedWooOrigin = new URL(base).origin;
    } catch {
      resolvedWooOrigin = base;
    }
  }
  const dev: Record<string, unknown> = {
    message: error instanceof Error ? error.message : String(error),
    resolvedWooOrigin,
    cmsWooBaseUrl: int?.wooBaseUrl?.trim() || null,
    hasWcBaseUrlEnv: Boolean(process.env.WC_BASE_URL?.trim()),
  };
  if (isAxiosError(error)) {
    dev.axiosCode = error.code;
    dev.upstreamStatus = error.response?.status;
    dev.requestPath = [error.config?.baseURL, error.config?.url]
      .filter(Boolean)
      .join("");
    const d = error.response?.data;
    if (d && typeof d === "object" && d !== null && "message" in d) {
      const m = (d as { message?: unknown }).message;
      if (typeof m === "string") {
        dev.wooMessage = m;
      }
    } else if (typeof d === "string") {
      dev.wooBody = d.slice(0, 300);
    }
    if (d && typeof d === "object" && d !== null && "code" in d) {
      const c = (d as { code?: unknown }).code;
      if (typeof c === "string") {
        dev.wooCode = c;
      }
    }
  }
  body.dev = dev;
  return body;
}

export async function wooBff502Response(error: unknown) {
  logWooBffFailure(error);
  return NextResponse.json(await buildWooBff502Body(error), { status: 502 });
}
