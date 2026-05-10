/**
 * Web App Manifest (ديناميكي)
 * بالعامية: الأسماء والألوان والأيقونات من CMS علشان PWA تطابق الهوية من غير ما نعدّل الملف يدوي.
 */
import type { MetadataRoute } from "next";
import { getPublicSiteContent } from "@/features/cms/services/getPublicSiteContent";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { branding } = await getPublicSiteContent();
  return {
    /** `id` ثابت علشان كروم يعرف إن دي نفس التطبيق بعد تحديثات الـ manifest. */
    id: "/",
    name: branding.pwaName,
    short_name: branding.pwaShortName,
    description: branding.pwaDescription,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: branding.backgroundColor,
    theme_color: branding.themeColor,
    lang: "ar",
    dir: "rtl",
    icons: [
      {
        src: branding.icon192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: branding.icon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
