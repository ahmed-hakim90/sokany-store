/** مسار ثابت خفيف للتحقق أن أصل المتجر يستجيب (ليس اتصال Woo الخارجي). */
export const STOREFRONT_CONNECTIVITY_PROBE_URL = "/images/icon-192.png";

const DEFAULT_PROBE_TIMEOUT_MS = 5_000;

/**
 * هل المتجر على نفس الأصل ي reachable؟ يُستخدم لتصحيح false-negative من `navigator.onLine`.
 */
export async function probeStorefrontConnectivity(
  fetchImpl: typeof fetch = fetch,
  timeoutMs = DEFAULT_PROBE_TIMEOUT_MS,
): Promise<boolean> {
  try {
    const res = await fetchImpl(STOREFRONT_CONNECTIVITY_PROBE_URL, {
      method: "HEAD",
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
    return res.ok;
  } catch {
    return false;
  }
}
