import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  const site = getSiteUrl();
  return {
    name: "سوكانى المغربى",
    short_name: "سوكانى",
    description: "أجهزة سوكانى الكهربائية من الوكيل الحصري",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ec7123",
    icons: [
      {
        src: `${site}/images/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: `${site}/images/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
      },
    ],
    lang: "ar",
    dir: "rtl",
  };
}
