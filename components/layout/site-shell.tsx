import { Suspense } from "react";
import { PwaEngagementStack } from "@/components/PwaEngagementStack";
import { FooterGate } from "@/components/layout/footer-gate";
import { MobileCommerceChrome } from "@/components/layout/mobile-commerce-chrome";
import { MobileScrollCollapseController } from "@/components/layout/mobile-scroll-collapse-controller";
import { MobileFloatingActions } from "@/components/layout/mobile-floating-actions";
import { TopAnnouncementBar } from "@/components/layout/top-announcement-bar";
import { Navbar } from "@/components/Navbar";
import { DesktopCartDrawer } from "@/features/cart/components/DesktopCartDrawer";
import { CatalogFilterDrawer } from "@/features/catalog/components/CatalogFilterDrawer";
import { DesktopWishlistDrawer } from "@/features/wishlist/components/DesktopWishlistDrawer";
import type { CmsTopAnnouncementBar } from "@/schemas/cms";
import type { ResolvedSiteBranding } from "@/lib/site-branding";
import type { SocialLink } from "@/lib/social-links";

export type SiteShellProps = {
  children: React.ReactNode;
  topAnnouncementBar: CmsTopAnnouncementBar;
  socialLinks: SocialLink[];
  branding: ResolvedSiteBranding;
  searchQuickKeywords: string[];
};

export function SiteShell({
  children,
  topAnnouncementBar,
  socialLinks,
  branding,
  searchQuickKeywords,
}: SiteShellProps) {
  return (
    <>
      <div className="sticky top-0 z-50 pt-[env(safe-area-inset-top)] max-lg:bg-white">
        <TopAnnouncementBar config={topAnnouncementBar} />
        <Suspense fallback={null}>
          <Navbar
            siteName={branding.siteName}
            logoPath={branding.logoPath}
            logoDisabled={branding.logoDisabled}
            searchQuickKeywords={searchQuickKeywords}
            socialLinks={socialLinks}
          />
        </Suspense>
      </div>
      <Suspense fallback={null}>
        <DesktopCartDrawer />
      </Suspense>
      <Suspense fallback={null}>
        <DesktopWishlistDrawer />
      </Suspense>
      <Suspense fallback={null}>
        <CatalogFilterDrawer />
      </Suspense>
      {/*
        فواصل الهيدر (ليست hr): border-b تحت الإعلان/شريط الموبايل؛ lg:border-b تحت صف الديسكتوب؛
        border-t فوق شريط التصنيفات (desktopSubheader)؛ على الموبايل border-t فوق السطر الثانوي إن وُجد.
        أول محتوى بعد الكتلة الثابتة: pt-2 خفيف.
      */}
      <main className="flex min-h-0 min-w-0 max-w-none flex-1 flex-col bg-page pb-mobile-commerce lg:pb-0 [&>*:first-child]:pt-2">
        {children}
      </main>
      <FooterGate
        socialLinks={socialLinks}
        siteName={branding.siteName}
        logoPath={branding.logoPath}
        logoDisabled={branding.logoDisabled}
      />
      <MobileFloatingActions socialLinks={socialLinks} />
      <MobileScrollCollapseController />
      <MobileCommerceChrome />
      <PwaEngagementStack />
    </>
  );
}
