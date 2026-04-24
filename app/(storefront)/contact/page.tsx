import type { Metadata } from "next";
import { ContactPageContent } from "@/components/pages/ContactPageContent";
import { SITE_BRAND_TITLE_AR } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";

const title = `تواصل معنا | ${SITE_BRAND_TITLE_AR}`;
const description = `تواصل مع فريق ${SITE_BRAND_TITLE_AR} عبر البريد أو تتبع طلبك — دعم عملاء في أوقات العمل المحددة.`;

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/contact`,
    siteName: SITE_BRAND_TITLE_AR,
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/contact` },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return <ContactPageContent />;
}
