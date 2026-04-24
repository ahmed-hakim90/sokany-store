import type { Metadata } from "next";
import { OfficialWpPageContent } from "@/components/pages/OfficialWpPageContent";
import { SITE_BRAND_TITLE_AR } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";

const title = `سياسة الاسترجاع والاستبدال | ${SITE_BRAND_TITLE_AR}`;
const description =
  "سياسة الاسترجاع والاستبدال — نص معتمد من الموقع الرسمي لوكيل سوكاني في مصر.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/returns`,
    siteName: SITE_BRAND_TITLE_AR,
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/returns` },
  robots: { index: true, follow: true },
};

export default function ReturnsPolicyPage() {
  return <OfficialWpPageContent slug="returns" heading="سياسة الاسترجاع والاستبدال" />;
}
