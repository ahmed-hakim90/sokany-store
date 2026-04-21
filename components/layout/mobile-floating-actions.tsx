import { MobileSocialSpeedDial } from "@/components/layout/mobile-social-speed-dial";
import { ScrollToTopButton } from "@/components/layout/scroll-to-top-button";
import type { SocialLink } from "@/lib/social-links";

export type MobileFloatingActionsProps = {
  socialLinks: SocialLink[];
};

/**
 * موبايل: سوشيال (speed dial) فوق زر التمرير لأعلى؛ سطح المكتب: زر التمرير فقط.
 * غلاف `fixed` واحد فوق شريط الموبايل السفلي.
 */
export function MobileFloatingActions({ socialLinks }: MobileFloatingActionsProps) {
  return (
    <div
      className={
        "fixed end-4 z-[55] flex flex-col-reverse items-end gap-2 " +
        "max-lg:bottom-[calc(var(--mobile-commerce-chrome-height,5rem)+0.75rem)] lg:bottom-8"
      }
    >
      <ScrollToTopButton />
      {socialLinks.length > 0 ? (
        <MobileSocialSpeedDial links={socialLinks} />
      ) : null}
    </div>
  );
}
