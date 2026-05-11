"use client";

import { usePathname } from "next/navigation";
import { MobileSocialSpeedDial } from "@/components/layout/mobile-social-speed-dial";
import { ScrollToTopButton } from "@/components/layout/scroll-to-top-button";
import { ROUTES } from "@/lib/constants";
import type { SocialLink } from "@/lib/social-links";

export type MobileFloatingActionsProps = {
  socialLinks: SocialLink[];
};

/**
 * موبايل: سوشيال (speed dial) فوق زر التمرير لأعلى؛ سطح المكتب: زر التمرير فقط.
 * غلاف `fixed` واحد فوق شريط الموبايل السفلي.
 */
export function MobileFloatingActions({ socialLinks }: MobileFloatingActionsProps) {
  const pathname = usePathname();
  if (pathname === ROUTES.ASSISTANT) return null;

  return (
    <div
      className={
        "fixed end-4 z-[55] flex flex-col-reverse items-end gap-2 " +
        "bottom-mobile-floating-actions lg:bottom-8"
      }
    >
      <ScrollToTopButton />
      {socialLinks.length > 0 ? (
        <MobileSocialSpeedDial links={socialLinks} />
      ) : null}
    </div>
  );
}
