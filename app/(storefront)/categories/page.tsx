import type { Metadata } from "next";
import { Suspense } from "react";
import {
  CategoriesPageContent,
  CategoriesPageLoadingFallback,
} from "@/components/pages/CategoriesPageContent";
import { SITE_BRAND_TITLE_AR } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";

const title = `التصنيفات | ${SITE_BRAND_TITLE_AR}`;
const description =
  "تصفح تصنيفات أجهزة سوكانى: مطبخ، منزلية، عناية شخصية، قهوة، والمزيد.";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["تصنيفات سوكانى", "أجهزة مطبخ", "عناية شخصية", "سوكانى"],
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/categories`,
    siteName: SITE_BRAND_TITLE_AR,
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/categories` },
  robots: { index: true, follow: true },
};

export default function CategoriesIndexPage() {
  return (
    <Suspense fallback={<CategoriesPageLoadingFallback />}>
      <CategoriesPageContent />
    </Suspense>
  );
}
