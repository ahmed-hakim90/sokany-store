import type { Metadata } from "next";
import { OfficialWpPageContent } from "@/components/pages/OfficialWpPageContent";
import { SITE_BRAND_TITLE_AR } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";

const title = `الصيانة والضمان | ${SITE_BRAND_TITLE_AR}`;
const description =
  "معلومات الصيانة والضمان — نص معتمد من الموقع الرسمي لوكيل سوكاني في مصر.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/warranty`,
    siteName: SITE_BRAND_TITLE_AR,
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/warranty` },
  robots: { index: true, follow: true },
};

export default function WarrantyPage() {
  return (
    <OfficialWpPageContent slug="warranty-and-maintenance" heading="الصيانة والضمان" />
  );
}
