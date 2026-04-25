import type { Metadata } from "next";
import { MyReviewsPageContent } from "@/components/pages/MyReviewsPageContent";
import { SITE_BRAND_TITLE_AR } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";

const title = `تقييماتي | ${SITE_BRAND_TITLE_AR}`;
const description = "المنتجات من طلباتك المكتملة التي تستطيع إضافة تقييم لها.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/my-reviews`,
    siteName: SITE_BRAND_TITLE_AR,
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/my-reviews` },
  robots: { index: false, follow: true },
};

export default function MyReviewsPage() {
  return <MyReviewsPageContent />;
}
