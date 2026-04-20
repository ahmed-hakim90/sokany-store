"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { ROUTES } from "@/lib/constants";

/** يخفي الفوتر على صفحة السلة لتوفير مساحة وتركيز على إتمام الشراء. */
export function FooterGate() {
  const pathname = usePathname();
  if (pathname === ROUTES.CART) {
    return null;
  }
  return <Footer />;
}
