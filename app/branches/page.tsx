import type { Metadata } from "next";
import { BranchesPageContent } from "@/components/pages/BranchesPageContent";
import { getPublicSiteContent } from "@/features/cms/services/getPublicSiteContent";
import { SITE_BRAND_TITLE_AR } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";

const title = `الفروع ومراكز الصيانة | ${SITE_BRAND_TITLE_AR}`;
const description =
  "فروع البيع ومراكز الصيانة المعتمدة — عناوين، واتساب، والموقع على الخريطة.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/branches`,
    siteName: SITE_BRAND_TITLE_AR,
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/branches` },
  robots: { index: true, follow: true },
};

export default async function BranchesPage() {
  const content = await getPublicSiteContent();
  return <BranchesPageContent branchesData={content.branches} />;
}
