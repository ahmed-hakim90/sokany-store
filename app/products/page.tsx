import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductsPageContent } from "@/components/pages/ProductsPageContent";
import { getSiteUrl } from "@/lib/site";

const title = "كل المنتجات | سوكانى المغربى";
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
    siteName: "سوكانى المغربى",
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/products` },
  robots: { index: true, follow: true },
};

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageContent />
    </Suspense>
  );
}
