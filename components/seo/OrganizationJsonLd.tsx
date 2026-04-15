import { getSiteUrl } from "@/lib/site";

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
    sameAs: [
      "https://www.facebook.com/SokanyElmaghraby",
      "https://www.instagram.com/SokanyElmaghraby",
      "https://www.youtube.com/@SokanyElmaghraby",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
