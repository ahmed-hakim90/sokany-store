import { Suspense } from "react";
import { PwaEngagementStack } from "@/components/PwaEngagementStack";
import { FooterGate } from "@/components/layout/footer-gate";
import { MobileCommerceChrome } from "@/components/layout/mobile-commerce-chrome";
import { MobileScrollCollapseController } from "@/components/layout/mobile-scroll-collapse-controller";
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
      <div className="sticky top-0 z-50">
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
      <main className="flex min-h-0 min-w-0 max-w-none flex-1 flex-col bg-page pb-mobile-commerce lg:pb-0">
        {children}
      </main>
      <FooterGate
        socialLinks={socialLinks}
        siteName={branding.siteName}
        logoPath={branding.logoPath}
        logoDisabled={branding.logoDisabled}
      />
      <MobileScrollCollapseController />
      <MobileCommerceChrome />
      <PwaEngagementStack />
    </>
  );
}
