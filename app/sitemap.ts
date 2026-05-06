import type { MetadataRoute } from "next";
import { getSitemapInventory } from "@/features/seo/services/getSitemapInventory";
import { getSiteUrl } from "@/lib/site";

/** إعادة توليد خريطة الموقع دورياً لتقليل ضغط WooCommerce ومواكبة الكتالوج. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const now = new Date();
  const { productIds, categorySlugs } = await getSitemapInventory();

  const productUrls: MetadataRoute.Sitemap = productIds.map((id) => ({
    url: `${site}/products/${id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryUrls: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${site}/categories/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    { url: site, lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: `${site}/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${site}/offers`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${site}/categories`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${site}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${site}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.55,
    },
    {
      url: `${site}/branches`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.55,
    },
    {
      url: `${site}/retailers`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.52,
    },
    {
      url: `${site}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.35,
    },
    {
      url: `${site}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.35,
    },
    {
      url: `${site}/returns`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.35,
    },
    {
      url: `${site}/warranty`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.35,
    },
    ...categoryUrls,
    ...productUrls,
  ];
}
