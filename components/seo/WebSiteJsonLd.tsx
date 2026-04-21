import { getSiteUrl } from "@/lib/site";

export type WebSiteJsonLdProps = {
  name: string;
  description?: string;
};

/**
 * WebSite + SearchAction — يدعم ظهور صندوق بحث الموقع في نتائج Google عند قبولها.
 * @see https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox
 */
export function WebSiteJsonLd({ name, description }: WebSiteJsonLdProps) {
  const site = getSiteUrl();
  const searchTarget = `${site}/search?q={search_term_string}`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url: site,
    potentialAction: {
      "@type": "SearchAction",
      target: searchTarget,
      "query-input": "required name=search_term_string",
    },
  };

  if (description?.trim()) {
    jsonLd.description = description.trim();
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
