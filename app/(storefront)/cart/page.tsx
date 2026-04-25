import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import { CartPageContent } from "@/components/pages/CartPageContent";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your cart before checkout",
  openGraph: {
    title: `Cart | ${SITE_NAME}`,
    description: "Review your cart before checkout",
  },
};

export default function CartPage() {
  return <CartPageContent />;
}
