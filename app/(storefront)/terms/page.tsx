import type { Metadata } from "next";
import { OfficialWpPageContent } from "@/components/pages/OfficialWpPageContent";
import { SITE_BRAND_TITLE_AR } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";

const title = `الشروط والأحكام | ${SITE_BRAND_TITLE_AR}`;
const description =
  "الشروط والأحكام المعمول بها — نص معتمد من الموقع الرسمي لوكيل سوكاني في مصر.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/terms`,
    siteName: SITE_BRAND_TITLE_AR,
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/terms` },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return <OfficialWpPageContent slug="terms-and-conditions" heading="الشروط والأحكام" />;
}
