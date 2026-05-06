import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductsCatalogSkeleton } from "@/components/pages/ProductsCatalogSkeleton";
import { OffersPageContent } from "@/components/pages/OffersPageContent";
import { SITE_BRAND_TITLE_AR } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";

const title = `العروض | ${SITE_BRAND_TITLE_AR}`;
const description =
  "تصفح كل منتجات سوكاني التي عليها خصومات حالية — عروض محدثة وأسعار بالجنيه المصري.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "عروض سوكاني",
    "خصومات سوكاني",
    "سوكاني مصر عروض",
    "sokany offers egypt",
  ],
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/offers`,
    siteName: SITE_BRAND_TITLE_AR,
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/offers` },
  robots: { index: true, follow: true },
};

export default function OffersPage() {
  return (
    <Suspense fallback={<ProductsCatalogSkeleton />}>
      <OffersPageContent />
    </Suspense>
  );
}
