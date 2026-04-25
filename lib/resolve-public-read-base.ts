import type { PublicSiteContent } from "@/features/cms/services/getPublicSiteContent";

/** عنوان الـ API العلني من CMS — جاهز لـ `fetch` من السيرفر. */
export function publicReadBaseAsUrl(
  content: Pick<PublicSiteContent, "publicReadBaseUrl">,
): URL | null {
  const raw = content.publicReadBaseUrl;
  if (!raw?.trim()) return null;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" ? u : null;
  } catch {
    return null;
  }
}
