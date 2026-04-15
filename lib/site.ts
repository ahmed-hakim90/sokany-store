const FALLBACK_SITE_URL = "https://sokany-eg.com";

/** أصل الموقع العام (canonical، OG، JSON-LD، صور مطلقة) */
function resolvePublicOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  if (process.env.NODE_ENV === "development") {
    return `http://localhost:${process.env.PORT || "3000"}`;
  }
  return FALLBACK_SITE_URL;
}

export function getSiteUrl(): string {
  return resolvePublicOrigin();
}

/** يحوّل مساراً نسبياً (`/images/...`) أو URL كاملاً إلى عنوان مطلق */
export function toAbsoluteSiteUrl(pathOrUrl: string): string {
  const t = pathOrUrl.trim();
  if (!t) return `${resolvePublicOrigin()}/images/placeholder.png`;
  if (/^https?:\/\//i.test(t)) return t;
  const path = t.startsWith("/") ? t : `/${t}`;
  return `${resolvePublicOrigin()}${path}`;
}
