import type { Metadata } from "next";
import { ServiceCentersPageContent } from "@/components/pages/ServiceCentersPageContent";
import { getSiteUrl } from "@/lib/site";

const title = "مراكز الخدمة | سوكانى المغربى";
const description =
  "فروع سوكانى المغربى ومراكز الخدمة — عناوين، هواتف، وروابط الخرائط.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/service-centers`,
    siteName: "سوكانى المغربى",
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/service-centers` },
  robots: { index: true, follow: true },
};

export default function ServiceCentersPage() {
  return <ServiceCentersPageContent />;
}
