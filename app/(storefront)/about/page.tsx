import type { Metadata } from "next";
import { AboutPageContent } from "@/components/pages/AboutPageContent";
import { SITE_BRAND_TITLE_AR } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";

const title = `من نحن | ${SITE_BRAND_TITLE_AR}`;
const description =
  "أكثر من 10 سنوات من سوكاني في مصر: الجودة، التكنولوجيا، والتصميم — مع مؤسسة المغربي كوكيل حصري، ضمان، صيانة، وتوزيع معتمد.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/about`,
    siteName: SITE_BRAND_TITLE_AR,
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/about` },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return <AboutPageContent />;
}
