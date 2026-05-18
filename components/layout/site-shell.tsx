/**
 * هيكل المتجر الرئيسي
 * بالعامية: تجميعة الهيدر، شريط التصنيفات، كروم الموبايل، الجيتات (سلة/فلتر)، والـ PWA — المحتوى بينهم بيروح لـ `main` بـ id ثابت للـ a11y.
 *
 * شوف كمان: `@/components/layout/mobile-commerce-chrome.tsx`، `@/lib/storefront-a11y.ts`
 */
import { Suspense } from "react";
import { PwaEngagementStack } from "@/components/PwaEngagementStack";
import { FooterGate } from "@/components/layout/footer-gate";
import { MobileCommerceChrome } from "@/components/layout/mobile-commerce-chrome";
import { MobileHeroLimeAtmosphere } from "@/components/layout/mobile-hero-lime-atmosphere";
import { MobileScrollCollapseController } from "@/components/layout/mobile-scroll-collapse-controller";
import { MobileFloatingActions } from "@/components/layout/mobile-floating-actions";
import { TopAnnouncementBar } from "@/components/layout/top-announcement-bar";
import { StorefrontPromoBar } from "@/features/promotions/components/storefront-promo-bar";
import { StorefrontHeaderCategoryStrip } from "@/components/layout/storefront-header-category-strip";
import { Navbar } from "@/components/Navbar";
import { DesktopCartDrawerGate } from "@/features/cart/components/desktop-cart-drawer-gate";
import { CatalogFilterDrawerGate } from "@/features/catalog/components/catalog-filter-drawer-gate";
import { StorefrontShellChrome } from "@/components/layout/storefront-shell-chrome";
import { ProductMerchandisingProvider } from "@/features/products/components/product-merchandising-context";
import { StorefrontCouponsProvider } from "@/features/promotions/components/storefront-coupons-context";
import { ProductsCouponsDock } from "@/features/promotions/components/products-coupons-dock";
import type { CmsStorefrontCoupon } from "@/schemas/cms";
import { SearchOverlayGate } from "@/features/search/components/search-overlay-gate";
import { DesktopWishlistDrawerGate } from "@/features/wishlist/components/desktop-wishlist-drawer-gate";
import { StorefrontAssistantWidget } from "@/features/assistant/components/StorefrontAssistantWidget";
import type {
  CmsHeaderCategoryStrip,
  CmsStorefrontPromoBar,
  CmsTopAnnouncementBar,
} from "@/schemas/cms";
import { STOREFRONT_MAIN_CONTENT_ID } from "@/lib/storefront-a11y";
import type { ResolvedSiteBranding } from "@/lib/site-branding";
import type { SocialLink } from "@/lib/social-links";

export type SiteShellProps = {
  children: React.ReactNode;
  storefrontPromoBar: CmsStorefrontPromoBar;
  topAnnouncementBar: CmsTopAnnouncementBar;
  socialLinks: SocialLink[];
  branding: ResolvedSiteBranding;
  searchQuickKeywords: string[];
  headerCategoryStrip: CmsHeaderCategoryStrip;
  storefrontCoupons: CmsStorefrontCoupon[];
  assistantEnabled?: boolean;
};

export function SiteShell({
  children,
  storefrontPromoBar,
  topAnnouncementBar,
  socialLinks,
  branding,
  searchQuickKeywords,
  headerCategoryStrip,
  storefrontCoupons,
  assistantEnabled = true,
}: SiteShellProps) {
  return (
    <StorefrontCouponsProvider coupons={storefrontCoupons}>
    <ProductMerchandisingProvider
      value={{
        productCardBadgeEnabled: branding.productCardBadgeEnabled,
        productCardBadgeText: branding.productCardBadgeText,
      }}
    >
      <header
        id="site-sticky-header-stack"
        className="sticky top-0 z-50 pt-[env(safe-area-inset-top)] max-lg:bg-transparent"
      >
        <StorefrontPromoBar config={storefrontPromoBar} coupons={storefrontCoupons} />
        <TopAnnouncementBar config={topAnnouncementBar} />
        <Navbar
          siteName={branding.siteName}
          logoPath={branding.logoPath}
          logoDisabled={branding.logoDisabled}
          searchQuickKeywords={searchQuickKeywords}
          socialLinks={socialLinks}
        />
        <StorefrontHeaderCategoryStrip config={headerCategoryStrip} />
      </header>
      <Suspense fallback={null}>
        <DesktopCartDrawerGate />
      </Suspense>
      <Suspense fallback={null}>
        <DesktopWishlistDrawerGate />
      </Suspense>
      <Suspense fallback={null}>
        <CatalogFilterDrawerGate />
      </Suspense>
      <Suspense fallback={null}>
        <SearchOverlayGate quickKeywords={searchQuickKeywords} />
      </Suspense>
      {/*
        معالم الصفحة: ‎`<header>`‎ ثم ‎`<main>`‎ ثم الفوتر (‎`FooterGate`‎ → ‎`<footer>`‎).
        ‎`MobileHeroLimeAtmosphere`‎ أول طفل داخل ‎`main`‎ (‎`fixed`‎ + ‎`z-0`‎)؛ غلاف المحتوى التالي ‎`relative z-[1]`‎
        لأن طبقة الرسم تضع ‎`z-index:0`‎ المُموضع فوق الكتل العادية — بدون ذلك تغطي الهالة النص والبطاقات.
        ‎`max-lg:z-[1]`‎ على ‎`main`‎ يتراص مقابل الإخوة (فوتر…)، وليس كافياً داخل ‎`main`‎.
        موبايل: ‎`main`‎ بلا ‎`bg`‎ حتى تُرى الهالة خلف الهيرو؛ ‎`pt-2`‎ على غلاف المحتوى (وليس على الهالة).
      */}
      <main
        id={STOREFRONT_MAIN_CONTENT_ID}
        tabIndex={-1}
        className="flex min-h-0 min-w-0 max-w-full flex-1 flex-col overflow-x-clip scroll-mt-[calc(env(safe-area-inset-top,0px)+8.75rem)] max-lg:relative max-lg:z-[1] max-lg:!bg-transparent bg-page pb-mobile-commerce lg:pb-0 lg:scroll-mt-28"
      >
        <MobileHeroLimeAtmosphere />
        <div className="relative z-[1] flex min-h-0 min-w-0 max-w-full flex-1 flex-col overflow-x-clip pt-2">
          <StorefrontShellChrome>{children}</StorefrontShellChrome>
        </div>
      </main>
      <FooterGate
        socialLinks={socialLinks}
        siteName={branding.siteName}
        logoPath={branding.logoPath}
        logoDisabled={branding.logoDisabled}
      />
      {assistantEnabled ? <StorefrontAssistantWidget /> : null}
      <MobileFloatingActions socialLinks={socialLinks} />
      <MobileScrollCollapseController />
      <MobileCommerceChrome />
      <ProductsCouponsDock />
      <PwaEngagementStack />
    </ProductMerchandisingProvider>
    </StorefrontCouponsProvider>
  );
}
