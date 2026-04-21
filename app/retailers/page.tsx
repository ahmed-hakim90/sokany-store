import type { Metadata } from "next";
import { RetailersPageContent } from "@/components/pages/RetailersPageContent";
import { getPublicSiteContent } from "@/features/cms/services/getPublicSiteContent";
import { getSiteUrl } from "@/lib/site";

const title = "الموزعون المعتمدون | سوكانى المغربى";
const description =
  "شبكة الموزعين المعتمدين لسوكانى في مصر — خريطة التغطية، محلات معتمدة، وضمان الوكيل والتسعير الرسمي.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/retailers`,
    siteName: "سوكانى المغربى",
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/retailers` },
  robots: { index: true, follow: true },
};

export default async function RetailersPage() {
  const content = await getPublicSiteContent();
  return (
    <RetailersPageContent
      retailers={content.retailers.list}
      mapHeroSrc={content.retailers.mapHeroSrc}
    />
  );
}
