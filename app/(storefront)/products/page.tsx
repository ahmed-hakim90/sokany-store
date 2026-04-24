import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductsCatalogSkeleton } from "@/components/pages/ProductsCatalogSkeleton";
import { ProductsPageContent } from "@/components/pages/ProductsPageContent";
import { SITE_BRAND_TITLE_AR } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";

const title = `كل المنتجات | ${SITE_BRAND_TITLE_AR}`;
const description =
  "تصفح جميع منتجات سوكانى: أجهزة مطبخ، عناية شخصية، قهوة، والمزيد — أسعار بالجنيه وضمان أصلي.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "منتجات سوكانى",
    "أجهزة مطبخ",
    "عناية شخصية",
    "سوكانى مصر",
    "sokany egypt",
  ],
  openGraph: {
    title,
    description,
    url: `${getSiteUrl()}/products`,
    siteName: SITE_BRAND_TITLE_AR,
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/products` },
  robots: { index: true, follow: true },
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsCatalogSkeleton />}>
      <ProductsPageContent />
    </Suspense>
  );
}
