import type { Metadata } from "next";
import { WishlistPageContent } from "@/components/pages/WishlistPageContent";
import { SITE_BRAND_TITLE_AR, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "المفضلة",
  description: "المنتجات التي حفظتها في متجر سوكاني.",
  openGraph: {
    title: `المفضلة | ${SITE_NAME}`,
    description: "المنتجات التي حفظتها للمراجعة لاحقاً.",
    siteName: SITE_BRAND_TITLE_AR,
    locale: "ar_EG",
  },
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return <WishlistPageContent />;
}
