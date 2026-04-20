import type { Metadata } from "next";
import { BranchesPageContent } from "@/components/pages/BranchesPageContent";
import { getSiteUrl } from "@/lib/site";

const title = "الفروع ومراكز الصيانة | سوكانى المغربى";
const description =
  "فروع البيع ومراكز الصيانة المعتمدة — عناوين، واتساب، والموقع على الخريطة.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/branches`,
    siteName: "سوكانى المغربى",
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/branches` },
  robots: { index: true, follow: true },
};

export default function BranchesPage() {
  return <BranchesPageContent />;
}
