import "server-only";

/**
 * عميل Woo على السيرفر
 * بالعامية: ده اللي بيطلع طلبات REST لـ WooCommerce من Node، بمفاتيح الـ env ومش من المتصفح.
 *
 * ملاحظات:
 * - ليه axios هنا: طبقة واحدة للـ Basic auth والـ timeout والـ retry على GET بس (آمن إن الطلب متكرر).
 * - حذر: متزودش retry على POST/PUT — ممكن تكرار جانبي في Woo.
 * - شوف كمان: `@/lib/resolve-woo-base-url.ts`، `@/features/products/services/*`
 */
import axios, { isAxiosError, type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { WC_REST_BASE_PATH } from "@/lib/constants";
import { resolveWooBaseUrlForServer } from "@/lib/resolve-woo-base-url";
import { logServerJson } from "@/lib/server-log";
import { WOO_ENV_NOT_CONFIGURED_MESSAGE } from "@/lib/woo-env-errors";
import { resolveWooCredentialsForServer } from "@/lib/woo-credentials-store";

/** Timeout علشان الطلب ما يعلقش لحد ما TCP يستسلم (أحياناً دقيقة+). */
const WOO_REQUEST_TIMEOUT_MS = 25_000;
/** أقصى مرات إعادة لـ GET بعد أول محاولة (٣ محاولات إجمالي مع الأولى). */
const WOO_GET_RETRY_MAX = 2;
const WOO_RETRY_BASE_MS = 400;

type ConfigWithWooRetry = InternalAxiosRequestConfig & {
  __wooRetryCount?: number;
  __wooStartedAt?: number;
};

function maybeLogWooLatency(
  config: InternalAxiosRequestConfig | undefined,
  status: number | null,
): void {
  if (process.env.SOKANY_LOG_WOO_LATENCY !== "true") return;
  const cfg = config as ConfigWithWooRetry;
  const start = cfg.__wooStartedAt;
  if (start == null) return;
  logServerJson("woo_upstream", {
    method: (cfg.method ?? "get").toUpperCase(),
    url: cfg.url ?? "",
    status,
    ms: Date.now() - start,
  });
}

function delay(ms: number) {
  return new Promise<void>((r) => {
    setTimeout(r, ms);
  });
}

function isIdempotentWooGet(config: InternalAxiosRequestConfig | undefined): boolean {
  return (config?.method ?? "get").toLowerCase() === "get";
}

function isRetryableWooUpstreamError(
  err: unknown,
  config: InternalAxiosRequestConfig,
): err is AxiosError {
  if (!isAxiosError(err)) return false;
  if (!isIdempotentWooGet(config)) return false;
  const st = err.response?.status;
  if (st != null) {
    return st === 502 || st === 503 || st === 504;
  }
  const c = err.code;
  return (
    c === "ECONNRESET" ||
    c === "ETIMEDOUT" ||
    c === "ECONNABORTED" ||
    c === "EPIPE" ||
    c === "ERR_SOCKET_TIMEOUT"
  );
}

export async function createWooClient() {
  const baseURL = await resolveWooBaseUrlForServer();
  const credentials = await resolveWooCredentialsForServer();
  if (!baseURL || !credentials) {
    throw new Error(WOO_ENV_NOT_CONFIGURED_MESSAGE);
  }
  const token = Buffer.from(`${credentials.consumerKey}:${credentials.consumerSecret}`).toString("base64");
  const baseUrlForClient = new URL(WC_REST_BASE_PATH, baseURL).toString();

  const client = axios.create({
    baseURL: baseUrlForClient,
    timeout: WOO_REQUEST_TIMEOUT_MS,
    headers: {
      Authorization: `Basic ${token}`,
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use((config) => {
    (config as ConfigWithWooRetry).__wooStartedAt = Date.now();
    return config;
  });

  client.interceptors.response.use(
    (r) => {
      maybeLogWooLatency(r.config, r.status);
      return r;
    },
    async (error) => {
      if (!isAxiosError(error) || !error.config) {
        return Promise.reject(error);
      }
      const cfg = error.config as ConfigWithWooRetry;
      const n = cfg.__wooRetryCount ?? 0;
      if (!isRetryableWooUpstreamError(error, cfg) || n >= WOO_GET_RETRY_MAX) {
        maybeLogWooLatency(
          cfg,
          error.response?.status != null ? error.response.status : null,
        );
        return Promise.reject(error);
      }
      cfg.__wooRetryCount = n + 1;
      const backoff = WOO_RETRY_BASE_MS * 2 ** n;
      await delay(backoff);
      return client.request(cfg);
    },
  );

  return client;
}
