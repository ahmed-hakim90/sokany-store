/**
 * طلبات تجارة موثوقة — تتجاوز كاش localStorage في api-client.
 * يُستخدم على PDP والسلة وcheckout قبل إنشاء الطلب.
 */
import type { AxiosRequestConfig } from "axios";

export const COMMERCE_TRUST_HEADER = "X-Sokany-Commerce-Trust";
export const COMMERCE_TRUST_HEADER_VALUE = "1";

export function withCommerceTrust(
  config?: AxiosRequestConfig,
): AxiosRequestConfig {
  return {
    ...config,
    headers: {
      ...(config?.headers as Record<string, string> | undefined),
      [COMMERCE_TRUST_HEADER]: COMMERCE_TRUST_HEADER_VALUE,
    },
  };
}

export function isCommerceTrustRequest(
  config: AxiosRequestConfig | undefined,
): boolean {
  if (!config?.headers) return false;
  const headers = config.headers as Record<string, string | undefined>;
  const direct = headers[COMMERCE_TRUST_HEADER];
  if (direct === COMMERCE_TRUST_HEADER_VALUE) return true;
  const lower = headers[COMMERCE_TRUST_HEADER.toLowerCase()];
  return lower === COMMERCE_TRUST_HEADER_VALUE;
}
