"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { ROUTES } from "@/lib/constants";
import type { SocialLink } from "@/lib/social-links";

export type FooterGateProps = {
  socialLinks: SocialLink[];
  siteName?: string;
  logoPath?: string;
  logoDisabled?: boolean;
};

/** يخفي الفوتر على صفحات تحتاج تركيزاً كاملاً مثل السلة وشاشة الشات. */
export function FooterGate({
  socialLinks,
  siteName,
  logoPath,
  logoDisabled,
}: FooterGateProps) {
  const pathname = usePathname();
  if (pathname === ROUTES.CART || pathname === ROUTES.ASSISTANT) {
    return null;
  }
  return (
    <Footer
      socialLinks={socialLinks}
      siteName={siteName}
      logoPath={logoPath}
      logoDisabled={logoDisabled}
    />
  );
}
