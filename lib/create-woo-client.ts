import "server-only";
import axios, { isAxiosError, type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { WC_REST_BASE_PATH } from "@/lib/constants";
import { resolveWooBaseUrlForServer } from "@/lib/resolve-woo-base-url";

/** Avoid hanging until OS TCP gives up (often 60s+). */
const WOO_REQUEST_TIMEOUT_MS = 25_000;
/** Idempotent GET only — at most this many *retries* after the first attempt (1 + 2 = 3 tries). */
const WOO_GET_RETRY_MAX = 2;
const WOO_RETRY_BASE_MS = 400;

type ConfigWithWooRetry = InternalAxiosRequestConfig & { __wooRetryCount?: number };

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

/**
 * يربط REST وو عبر ‎`WC_CONSUMER_KEY` / ‎`WC_CONSUMER_SECRET` + أصل المتجر
 * (‎`WC_BASE_URL` أو ‎`storefrontIntegrations.wooBaseUrl` في CMS).
 */
export async function createWooClient() {
  const baseURL = await resolveWooBaseUrlForServer();
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;
  if (!baseURL || !key || !secret) {
    throw new Error("WooCommerce server environment is not configured");
  }
  const token = Buffer.from(`${key}:${secret}`).toString("base64");
  const baseUrlForClient = new URL(WC_REST_BASE_PATH, baseURL).toString();

  const client = axios.create({
    baseURL: baseUrlForClient,
    timeout: WOO_REQUEST_TIMEOUT_MS,
    headers: {
      Authorization: `Basic ${token}`,
      "Content-Type": "application/json",
    },
  });

  client.interceptors.response.use(
    (r) => r,
    async (error) => {
      if (!isAxiosError(error) || !error.config) {
        return Promise.reject(error);
      }
      const cfg = error.config as ConfigWithWooRetry;
      const n = cfg.__wooRetryCount ?? 0;
      if (!isRetryableWooUpstreamError(error, cfg) || n >= WOO_GET_RETRY_MAX) {
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
