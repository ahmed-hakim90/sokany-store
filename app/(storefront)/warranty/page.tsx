import type { Metadata } from "next";
import { WarrantyPageContent } from "@/components/pages/WarrantyPageContent";
import { AboutPartnershipJsonLd } from "@/components/seo/AboutPartnershipJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { FaqPageJsonLd } from "@/components/seo/FaqPageJsonLd";
import { getPublicSiteContent } from "@/features/cms/services/getPublicSiteContent";
import {
  WARRANTY_LANDING_META,
  warrantyLandingFaq,
  warrantyPartnershipJsonLd,
} from "@/features/warranty/content/warranty-landing-content";
import { getSiteUrl } from "@/lib/site";

const { title, description, keywords } = WARRANTY_LANDING_META;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: [...keywords],
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/warranty`,
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/warranty` },
  robots: { index: true, follow: true },
};

export default async function WarrantyPage() {
  const { branding } = await getPublicSiteContent();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "الرئيسية", href: "/" },
          { name: "ضمان سوكاني", href: "/warranty" },
        ]}
      />
      <AboutPartnershipJsonLd
        pagePath="/warranty"
        distributorName={warrantyPartnershipJsonLd.distributorName}
        brandName={warrantyPartnershipJsonLd.brandName}
        description={warrantyPartnershipJsonLd.description}
        logoUrl={branding.organizationLogoUrl}
        telephone={branding.supportPhoneDisplay}
      />
      <FaqPageJsonLd items={warrantyLandingFaq} />
      <WarrantyPageContent />
    </>
  );
}
