/**
 * مسارات ملفات الـ CMS المرفوعة: يُرجع `/api/m/...` (نسبي لأصل **الطلب/النسخ** من المتصفّح).
 * لا تُلحق نطاقًا ثابتًا (لا NEXT_PUBLIC_SITE_URL) حتى ينسخ المشرف من نفس العنوان المعروض (معاينة، Vercel، …).
 */

/** المسار في تخزين GCS: `cms/...` */
export function isSafeCmsObjectPath(p: string): boolean {
  if (p.length < 5 || p.length > 1024) return false;
  if (!p.startsWith("cms/")) return false;
  if (p.includes("..") || p.includes("\0")) return false;
  const segs = p.split("/");
  if (segs.some((s) => s.length === 0)) return false;
  return true;
}

/** `GET` على الموقع: `/api/m/<بعد-cms/>` (مناسب لـ `src` و`iframe` ونسخ: أصلٌ = `location.origin`) */
export function publicCmsFilePathFromStoragePath(storagePath: string): string | null {
  if (!isSafeCmsObjectPath(storagePath)) return null;
  const rest = storagePath.slice(4);
  if (!rest) return null;
  return `/api/m/${rest.split("/").map(encodeURIComponent).join("/")}`;
}

/**
 * يربط نسبي `/api/m/...` (أو مطلق قديم) بأصل **الحالي** (نافذة غالبًا: لوحة التحكم/المتجر).
 */
export function toAbsoluteCmsFileUrlInBrowser(href: string): string {
  if (!href) return href;
  if (/^https?:\/\//i.test(href)) return href;
  if (typeof window === "undefined") return href;
  return `${window.location.origin}${href.startsWith("/") ? href : `/${href}`}`;
}
