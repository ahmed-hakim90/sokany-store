import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/checkout/",
        "/account/",
        "/cart/",
        "/control/",
        "/login",
        "/register",
        "/wishlist",
        "/my-orders",
        "/my-reviews",
      ],
    },
    sitemap: `${site}/sitemap.xml`,
  };
}
