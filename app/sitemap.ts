import type { MetadataRoute } from "next";
import { mockCategories } from "@/features/categories/mock";
import { mockProducts } from "@/features/products/mock";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const now = new Date();

  const productUrls: MetadataRoute.Sitemap = mockProducts.map((p) => ({
    url: `${site}/products/${p.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryUrls: MetadataRoute.Sitemap = mockCategories.map((c) => ({
    url: `${site}/categories/${c.slug}`,
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
      url: `${site}/service-centers`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.55,
    },
    ...categoryUrls,
    ...productUrls,
  ];
}
