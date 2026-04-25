import { getSiteUrl } from "@/lib/site";

export type BreadcrumbItem = { name: string; href?: string };

type Props = { items: BreadcrumbItem[] };

export function BreadcrumbJsonLd({ items }: Props) {
  const site = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.href ? { item: `${site}${item.href}` } : {}),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
