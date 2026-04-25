import type { MetadataRoute } from "next";
import { getPublicSiteContent } from "@/features/cms/services/getPublicSiteContent";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { branding } = await getPublicSiteContent();
  return {
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
