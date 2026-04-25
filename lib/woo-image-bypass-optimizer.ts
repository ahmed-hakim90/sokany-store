import { OFFICIAL_SOKANY_SITE_URL } from "@/lib/constants";

let cachedSokanyHost: string;
try {
  cachedSokanyHost = new URL(OFFICIAL_SOKANY_SITE_URL).hostname;
} catch {
  cachedSokanyHost = "sokany-eg.com";
}

/**
 * جعل Next.js ‎`Image`‎ بـ ‎`unoptimized`‎ لعناوين ‎Woo/WordPress عند ‎`sokany-eg.com`‎
 * — يتجنب مهلة ‎`/_next/image`‎ (≈7s) عندما يُبطئ السيرفر الرفع/الريسبونس.
 * الصورة تُجلب مباشرة في المتصفح.
 */
export function isWooHostedProductImageUrl(url: string): boolean {
  const t = url.trim();
  if (!/^https?:\/\//i.test(t)) return false;
  try {
    const h = new URL(t).hostname.toLowerCase();
    if (h === cachedSokanyHost) return true;
    if (h === `www.${cachedSokanyHost}`) return true;
  } catch {
    return false;
  }
  return false;
}
