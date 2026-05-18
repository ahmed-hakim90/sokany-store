import { getSiteUrl, toAbsoluteSiteUrl } from "@/lib/site";

type Props = {
  distributorName: string;
  brandName: string;
  description: string;
  logoUrl: string;
  telephone: string;
  /** Canonical page path for Organization @id (default `/about`). */
  pagePath?: string;
};

/** بيانات منظمة خاصة بصفحة من نحن — الوكيل الحصري + العلامة. */
export function AboutPartnershipJsonLd({
  distributorName,
  brandName,
  description,
  logoUrl,
  telephone,
  pagePath = "/about",
}: Props) {
  const site = getSiteUrl();
  const pageUrl = `${site}${pagePath.startsWith("/") ? pagePath : `/${pagePath}`}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${pageUrl}#distributor`,
        name: distributorName,
        url: pageUrl,
        logo: toAbsoluteSiteUrl(logoUrl),
        description,
        areaServed: {
          "@type": "Country",
          name: "Egypt",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone,
          contactType: "customer service",
          availableLanguage: ["Arabic", "English"],
        },
        brand: {
          "@type": "Brand",
          name: brandName,
        },
      },
      {
        "@type": "Brand",
        "@id": `${pageUrl}#sokany-brand`,
        name: brandName,
        description: "أجهزة سوكاني الأصلية في مصر — مطبخ، منزل، وعناية شخصية.",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
