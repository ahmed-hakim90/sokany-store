import { getSiteUrl } from "@/lib/site";
import { SOCIAL_LINKS } from "@/lib/social-links";

export function OrganizationJsonLd() {
  const site = getSiteUrl();
  const phone =
    process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim() || "+20-xxx-xxx-xxxx";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "سوكانى المغربى",
    url: site,
    logo: "https://sokany-eg.com/wp-content/uploads/2022/08/SOKANY-EG-2png.png",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: phone,
      contactType: "customer service",
      availableLanguage: "Arabic",
    },
    sameAs: SOCIAL_LINKS.map((s) => s.href),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
