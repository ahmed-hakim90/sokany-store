import type { Metadata } from "next";
import { ContactPageContent } from "@/components/pages/ContactPageContent";
import { getSiteUrl } from "@/lib/site";

const title = "تواصل معنا | سوكانى المغربى";
const description =
  "تواصل مع فريق سوكانى المغربى عبر البريد أو تتبع طلبك — دعم عملاء في أوقات العمل المحددة.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/contact`,
    siteName: "سوكانى المغربى",
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/contact` },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return <ContactPageContent />;
}
