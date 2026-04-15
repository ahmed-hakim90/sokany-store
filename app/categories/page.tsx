import type { Metadata } from "next";
import { CategoriesPageContent } from "@/components/pages/CategoriesPageContent";
import { getSiteUrl } from "@/lib/site";

const title = "التصنيفات | سوكانى المغربى";
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
    siteName: "سوكانى المغربى",
    locale: "ar_EG",
    type: "website",
  },
  alternates: { canonical: `${getSiteUrl()}/categories` },
  robots: { index: true, follow: true },
};

export default function CategoriesIndexPage() {
  return <CategoriesPageContent />;
}
