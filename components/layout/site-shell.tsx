import { Suspense } from "react";
import { PwaEngagementStack } from "@/components/PwaEngagementStack";
import { FooterGate } from "@/components/layout/footer-gate";
import { MobileCommerceChrome } from "@/components/layout/mobile-commerce-chrome";
import { MobileHeroLimeAtmosphere } from "@/components/layout/mobile-hero-lime-atmosphere";
import { MobileScrollCollapseController } from "@/components/layout/mobile-scroll-collapse-controller";
import { MobileFloatingActions } from "@/components/layout/mobile-floating-actions";
import { TopAnnouncementBar } from "@/components/layout/top-announcement-bar";
import { StorefrontHeaderCategoryStrip } from "@/components/layout/storefront-header-category-strip";
import { Navbar } from "@/components/Navbar";
import { DesktopCartDrawer } from "@/features/cart/components/DesktopCartDrawer";
import { CatalogFilterDrawer } from "@/features/catalog/components/CatalogFilterDrawer";
import { DesktopWishlistDrawer } from "@/features/wishlist/components/DesktopWishlistDrawer";
import type { CmsHeaderCategoryStrip, CmsTopAnnouncementBar } from "@/schemas/cms";
import type { ResolvedSiteBranding } from "@/lib/site-branding";
import type { SocialLink } from "@/lib/social-links";

export type SiteShellProps = {
  children: React.ReactNode;
  topAnnouncementBar: CmsTopAnnouncementBar;
  socialLinks: SocialLink[];
  branding: ResolvedSiteBranding;
  searchQuickKeywords: string[];
  headerCategoryStrip: CmsHeaderCategoryStrip;
};

export function SiteShell({
  children,
  topAnnouncementBar,
  socialLinks,
  branding,
  searchQuickKeywords,
  headerCategoryStrip,
}: SiteShellProps) {
  return (
    <>
      <MobileHeroLimeAtmosphere />
      <div
        id="site-sticky-header-stack"
        className="sticky top-0 z-50 pt-[env(safe-area-inset-top)] max-lg:bg-transparent"
      >
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
        <StorefrontHeaderCategoryStrip config={headerCategoryStrip} />
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
        ‎`MobileHeroLimeAtmosphere`‎: ‎`z-0` ليكون **خلف** ‎`main`‎ (‎`max-lg:z-1`‎)؛ ‎`main`‎ موبايل ‎`bg`‎ شفاف
        حتى تظهر الهالة **خلف** المحتوى (مثل بانر الرئيسية). موبايل: هالة تتناقص مع السكرول/طي الشعار.
        كتلة ‎`site-sticky-header-stack`‎: إعلان + Navbar + شريط اختصارات التصنيفات — لاصقة معاً (‎`sticky top-0 z-50`‎).
        أول محتوى بعد الكتلة: pt-2 خفيف على أول طفل لـ main.
      */}
      <main className="flex min-h-0 min-w-0 max-w-none flex-1 flex-col max-lg:relative max-lg:z-[1] max-lg:!bg-transparent bg-page pb-mobile-commerce lg:pb-0 [&>*:first-child]:pt-2">
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
