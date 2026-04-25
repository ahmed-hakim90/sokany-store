import { getSiteUrl } from "@/lib/site";

export type OrganizationJsonLdProps = {
  /** روابط السوشيال — نفس مصدر الفوتر (CMS أو الافتراضي). */
  sameAs: string[];
  organizationName: string;
  logoUrl: string;
  telephone: string;
  /** وصف قصير للمنظمة — يُعرَض أحياناً في الأغراض الغنية. */
  description?: string;
};

export function OrganizationJsonLd({
  sameAs,
  organizationName,
  logoUrl,
  telephone,
  description,
}: OrganizationJsonLdProps) {
  const site = getSiteUrl();

  const jsonLd: Record<string, unknown> = {
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
