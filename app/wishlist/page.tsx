import type { Metadata } from "next";
import { WishlistPageContent } from "@/components/pages/WishlistPageContent";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "المفضلة",
  description: "المنتجات التي حفظتها في متجر سوكاني.",
  openGraph: {
    title: `المفضلة | ${SITE_NAME}`,
    description: "المنتجات التي حفظتها للمراجعة لاحقاً.",
  },
};

export default function WishlistPage() {
  return <WishlistPageContent />;
}
