import { getSiteUrl } from "@/lib/site";

export type OrganizationJsonLdProps = {
  /** روابط السوشيال — نفس مصدر الفوتر (CMS أو الافتراضي). */
  sameAs: string[];
  organizationName: string;
  logoUrl: string;
  telephone: string;
};

export function OrganizationJsonLd({
  sameAs,
  organizationName,
  logoUrl,
  telephone,
}: OrganizationJsonLdProps) {
  const site = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: organizationName,
    url: site,
    logo: logoUrl,
    contactPoint: {
      "@type": "ContactPoint",
      telephone,
      contactType: "customer service",
      availableLanguage: "Arabic",
    },
    sameAs,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
