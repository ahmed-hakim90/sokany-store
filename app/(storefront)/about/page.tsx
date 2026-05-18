import type { Metadata } from "next";
import { AboutPageContent } from "@/components/pages/AboutPageContent";
import { AboutPartnershipJsonLd } from "@/components/seo/AboutPartnershipJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { FaqPageJsonLd } from "@/components/seo/FaqPageJsonLd";
import { getPublicSiteContent } from "@/features/cms/services/getPublicSiteContent";
import {
  ABOUT_LANDING_META,
  aboutLandingFaq,
  aboutPartnershipJsonLd,
} from "@/features/about/content/about-landing-content";
import { getSiteUrl } from "@/lib/site";

const { title, description, keywords } = ABOUT_LANDING_META;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: [...keywords],
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/about`,
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/about` },
  robots: { index: true, follow: true },
};

export default async function AboutPage() {
  const { branding } = await getPublicSiteContent();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "الرئيسية", href: "/" },
          { name: "من نحن", href: "/about" },
        ]}
      />
      <AboutPartnershipJsonLd
        distributorName={aboutPartnershipJsonLd.distributorName}
        brandName={aboutPartnershipJsonLd.brandName}
        description={aboutPartnershipJsonLd.description}
        logoUrl={branding.organizationLogoUrl}
        telephone={branding.supportPhoneDisplay}
      />
      <FaqPageJsonLd items={aboutLandingFaq} />
      <AboutPageContent />
    </>
  );
}
