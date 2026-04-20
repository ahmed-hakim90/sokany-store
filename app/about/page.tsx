import type { Metadata } from "next";
import { AboutPageContent } from "@/components/pages/AboutPageContent";
import { getSiteUrl } from "@/lib/site";

const title = "من نحن | سوكانى المغربى";
const description =
  "أكثر من 10 سنوات من سوكاني في مصر: الجودة، التكنولوجيا، والتصميم — مع مؤسسة المغربي كوكيل حصري، ضمان، صيانة، وتوزيع معتمد.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/about`,
    siteName: "سوكانى المغربى",
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/about` },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return <AboutPageContent />;
}
