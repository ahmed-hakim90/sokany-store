import "server-only";

/**
 * عمر كاش `unstable_cache` لـ BFF اللي بيكلم Woo
 * بالعامية: بنحدد كل قد إيه Next يعتبر بيانات Woo «لسه صالحة» قبل ما يعيد الجلب.
 *
 * ملاحظات:
 * - ليه env: تضبط التوازن بين ضغط Woo وحداثة الكتالوج من غير ما نغيّر كود.
 * - الحدود ٦٠–٣٦٠٠ ثانية علشان ما يحصلش قيم مجنونة بالغلط.
 * - شوف كمان: `@/app/api/products/route.ts`، `@/lib/woocommerce-cache-tags.ts`
 */
const DEFAULT_SEC = 300;
const MIN_SEC = 60;
const MAX_SEC = 3600;

function parseRevalidateSec(): number {
  const raw = process.env.WOO_BFF_CACHE_REVALIDATE_SEC?.trim();
  if (!raw) return DEFAULT_SEC;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return DEFAULT_SEC;
  return Math.min(MAX_SEC, Math.max(MIN_SEC, n));
}

export const WOO_BFF_UNSTABLE_CACHE_REVALIDATE_SEC = parseRevalidateSec();
