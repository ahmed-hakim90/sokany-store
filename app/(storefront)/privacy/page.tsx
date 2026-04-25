import type { Metadata } from "next";
import { OfficialWpPageContent } from "@/components/pages/OfficialWpPageContent";
import { SITE_BRAND_TITLE_AR } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";

const title = `سياسة الخصوصية | ${SITE_BRAND_TITLE_AR}`;
const description =
  "سياسة الخصوصية — نص معتمد من الموقع الرسمي لوكيل سوكاني في مصر.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/privacy`,
    siteName: SITE_BRAND_TITLE_AR,
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/privacy` },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return <OfficialWpPageContent slug="privcy-policy" heading="سياسة الخصوصية" />;
}
