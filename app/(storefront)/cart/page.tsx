import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import { CartPageContent } from "@/components/pages/CartPageContent";

export const metadata: Metadata = {
  title: "سلة التسوق",
  description: "راجع منتجاتك قبل إتمام الطلب من متجر سوكاني.",
  openGraph: {
    title: `سلة التسوق | ${SITE_NAME}`,
    description: "راجع منتجاتك قبل إتمام الطلب من متجر سوكاني.",
  },
};

export default function CartPage() {
  return <CartPageContent />;
}
