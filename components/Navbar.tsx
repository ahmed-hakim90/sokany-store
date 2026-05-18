"use client";

import dynamic from "next/dynamic";
import { Link } from "next-view-transitions";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { AppImage } from "@/components/AppImage";
import {
  mobileNavDrawerReturnFocusRef,
  useMobileNavDrawerOpenStore,
} from "@/components/layout/mobile-nav-drawer-open-store";
import { MobileStoreHotline } from "@/components/layout/mobile-store-hotline";
import {
  NavbarSearch,
  NavbarSearchRowSkeleton,
} from "@/components/layout/navbar-search";
import { MobileStorefrontHeaderToolbar } from "@/components/layout/mobile-storefront-header-toolbar";
import { useMobileChromeCollapsedStore } from "@/components/layout/mobile-chrome-collapsed-store";
import { DesktopCategoryMegaNav } from "@/components/layout/desktop-category-mega-nav";
import { HeaderAccountMenu } from "@/components/layout/header-account-menu";
import { TopHeader } from "@/components/layout/top-header";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { HOME_CATEGORIES_QUERY_PARAMS } from "@/features/home/lib/home-page-product-params";
import { mockCategories } from "@/features/categories/mock";
import type { Category } from "@/features/categories/types";
import { useCartDrawerOpenStore } from "@/features/cart/store/useCartDrawerOpenStore";
import { useSearchOverlayOpenStore } from "@/features/search/store/useSearchOverlayOpenStore";
import { useWishlistDrawerOpenStore } from "@/features/wishlist/store/useWishlistDrawerOpenStore";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { ROUTES, SITE_LOGO_DISABLED, SITE_LOGO_PATH, SITE_NAME } from "@/lib/constants";
import {
  desktopPrimaryBarExtraLinks,
  desktopSecondaryNavLinks,
  mobileDrawerLinkSections,
  servicesDropdownLinks,
} from "@/lib/storefront-nav-links";
import { DEFAULT_SEARCH_QUICK_KEYWORDS } from "@/lib/search-quick-keywords";
import { SOCIAL_LINKS, type SocialLink } from "@/lib/social-links";
import { cn } from "@/lib/utils";

const MobileNavDrawer = dynamic(
  () =>
    import("@/components/layout/mobile-nav-drawer").then(
      (m) => m.MobileNavDrawer,
    ),
  { ssr: false, loading: () => null },
);

function subscribeHydrationSnapshot() {
  return () => {};
}

function getHydratedSnapshot() {
  return true;
}

function getServerHydrationSnapshot() {
  return false;
}

/**
 * Navbar — بحث وفلترة وسلة وفئات؛ الديسكتوب يبقى كما هو؛ موبايل:
 * —
 * الهوية الثلاثية: بحث (أيقونة) + المفضّلة (الجانب البصري الأيسر في RTL)، الشعار، كتلة الخط الساخن.
 * تحت ذلك: شرائح اختصارات أفقية (عروض/الكتالوج…) + «المزيد» يستدعي نفس درج الخدمات، وأخيرًا بطاقة عدم اتصال مدمجة.
 */

/** أوضاع الزّرّ الدائري الموحَّدة لموبايل (ميزة تسوق/ميزة عميل). — يحتاج ‎relative‎ لعلامات العدّ. */
const mobileCommerceIconOrbClass =
  "relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/[0.095] bg-white/92 text-brand-950 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.55)] outline-none transition-[transform,background-color,box-shadow] duration-200 ease-out hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 motion-reduce:transition-none active:scale-[0.97]";

const mobileCheckoutBackOrbClass =
  "relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/55 bg-[color-mix(in_srgb,white_88%,transparent)] text-brand-900 shadow-inner outline-none transition-[background-color,color,transform] duration-200 hover:bg-white/95 active:scale-[0.96] motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500";

/** أبعاد صورة الشعار في الهيدر (ديسكتوب + موبايل). */
const headerLogoImageBoxClass =
  "relative h-16 w-36 overflow-hidden sm:h-[4.25rem] sm:w-44";
const headerLogoImageBoxMobileClass =
  "relative mx-auto h-16 w-36 max-w-full overflow-hidden sm:h-16 sm:w-40";
const headerLogoImageSizesDesktop = "(max-width: 1023px) 144px, 176px";
const headerLogoImageSizesMobile = "(max-width: 640px) 144px, 160px";

export type NavbarProps = {
  /** من CMS أو الافتراضي من الثوابت عند عدم التمرير. */
  siteName?: string;
  logoPath?: string;
  logoDisabled?: boolean;
  /** من `getPublicSiteContent` — عند عدم التمرير تُستخدم القائمة الافتراضية من الكود. */
  searchQuickKeywords?: readonly string[];
  /** روابط السوشيال للشريط الديسكتوب — من CMS أو الافتراضي. */
  socialLinks?: readonly SocialLink[];
};

function MobileCartLink({
  totalItems,
  className,
}: {
  totalItems: number;
  /** يُطبَّق بعد فئات الزرّ الموحَّدة لمزيد من تخصيص الصفحة. */
  className?: string;
}) {
  return (
    <Link
      href={ROUTES.CART}
      className={cn(mobileCommerceIconOrbClass, className)}
      aria-label="السلة"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[17px] w-[17px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.45"
        aria-hidden
      >
        <path d="M6 6h15l-1.5 9h-12z" />
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </svg>
      {totalItems > 0 ? (
        <span className="absolute -top-1 -end-1 inline-flex min-h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-brand-500 px-0.5 text-[9px] font-bold text-black">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      ) : null}
    </Link>
  );
}

export function Navbar({
  siteName = SITE_NAME,
  logoPath = SITE_LOGO_PATH,
  logoDisabled = SITE_LOGO_DISABLED,
  searchQuickKeywords = DEFAULT_SEARCH_QUICK_KEYWORDS,
  socialLinks = SOCIAL_LINKS,
}: NavbarProps = {}) {
  const pathname = usePathname();
  const open = useMobileNavDrawerOpenStore((s) => s.open);
  const closeDrawer = useMobileNavDrawerOpenStore((s) => s.closeDrawer);
  const [mobileDrawerEverOpen, setMobileDrawerEverOpen] = useState(false);
  const { totalItems } = useCart();
  const { totalCount: wishlistCount } = useWishlist();
  const categoriesQuery = useCategories(HOME_CATEGORIES_QUERY_PARAMS);
  const hasMounted = useSyncExternalStore(
    subscribeHydrationSnapshot,
    getHydratedSnapshot,
    getServerHydrationSnapshot,
  );
  const fallbackCategories = useMemo<Category[]>(
    () =>
      mockCategories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image?.src ?? null,
        count: c.count,
        parentId: c.parent,
      })),
    [],
  );
  const navCategories = useMemo(
    () =>
      (hasMounted && categoriesQuery.data && categoriesQuery.data.length > 0
        ? categoriesQuery.data
        : fallbackCategories
      ).filter((c) => c.count > 0),
    [categoriesQuery.data, fallbackCategories, hasMounted],
  );
  const openDesktopCartDrawer = useCartDrawerOpenStore((s) => s.openDrawer);
  const closeDesktopCartDrawer = useCartDrawerOpenStore((s) => s.closeDrawer);
  const desktopCartDrawerOpen = useCartDrawerOpenStore((s) => s.open);
  const openDesktopWishlistDrawer = useWishlistDrawerOpenStore((s) => s.openDrawer);
  const closeDesktopWishlistDrawer = useWishlistDrawerOpenStore((s) => s.closeDrawer);
  const desktopWishlistDrawerOpen = useWishlistDrawerOpenStore((s) => s.open);
  const openSearchOverlay = useSearchOverlayOpenStore((s) => s.openOverlay);
  const mobileTopRowHidden = useMobileChromeCollapsedStore(
    (s) => s.headerHidden,
  );
  const isCheckout = pathname === ROUTES.CHECKOUT;
  const isAbout = pathname === ROUTES.ABOUT;
  const isHome = pathname === ROUTES.HOME;
  const logoImagePriority = !isHome;

  useEffect(() => {
    if (isCheckout) closeDrawer();
  }, [isCheckout, closeDrawer]);
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => setMobileDrawerEverOpen(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);
  const isServiceCenters =
    pathname === ROUTES.SERVICE_CENTERS ||
    pathname.startsWith(`${ROUTES.SERVICE_CENTERS}/`);
  const isRetailers =
    pathname === ROUTES.RETAILERS ||
    pathname.startsWith(`${ROUTES.RETAILERS}/`);
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);
  const showHeaderWordmarkText = logoDisabled || logoLoadFailed;
  const headerBrandTextClass =
    "truncate font-display text-lg font-semibold tracking-tight text-brand-950 sm:text-xl";

  // لوجو السايت في التوب ناف بار — بدون صورة: اسم الموقع (أو تعطيل اللوجو عبر env فارغ)
  const logo = (
    <Link href={ROUTES.HOME} className="flex min-w-0 items-center gap-2.5">
      {showHeaderWordmarkText ? (
        <span className={cn(headerBrandTextClass, "max-w-[11rem]")}>{siteName}</span>
      ) : (
        <div className={headerLogoImageBoxClass}>
          <AppImage
            src={logoPath}
            alt={siteName}
            fill
            sizes={headerLogoImageSizesDesktop}
            className="object-contain"
            priority={logoImagePriority}
            fetchPriority={isHome ? "low" : "high"}
            usePlaceholderOnError={false}
            onLoadError={() => setLogoLoadFailed(true)}
          />
        </div>
      )}
    </Link>
  );

  const desktopSubheader =
    !isCheckout ? (
      <DesktopCategoryMegaNav
        categories={navCategories}
        categoriesLoading={categoriesQuery.isLoading}
        primaryBarExtraLinks={desktopPrimaryBarExtraLinks}
        secondaryLinks={desktopSecondaryNavLinks}
        moreLinks={servicesDropdownLinks}
        socialLinks={socialLinks}
      />
    ) : null;

  const trailing = (
    <div className="hidden items-center gap-2 lg:flex">
      <MobileStoreHotline className="h-10 shrink-0 whitespace-nowrap px-1 text-sm" />
      <HeaderAccountMenu />
      <button
        type="button"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-white text-brand-950 shadow-sm transition-colors hover:bg-surface-muted/50"
        aria-label="المفضلة"
        aria-expanded={desktopWishlistDrawerOpen}
        aria-haspopup="dialog"
        aria-controls="desktop-wishlist-drawer-panel"
        onClick={() => {
          closeDesktopCartDrawer();
          openDesktopWishlistDrawer();
        }}
      >
        <WishlistHeartGlyph className="h-[18px] w-[18px]" />
        {wishlistCount > 0 ? (
          <span className="absolute -top-1 -end-1 inline-flex min-h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-brand-500 px-0.5 text-[9px] font-bold text-black">
            {wishlistCount > 99 ? "99+" : wishlistCount}
          </span>
        ) : null}
      </button>
      <button
        type="button"
        data-cart-fly-target="desktop"
        className="relative inline-flex h-10 items-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-bold text-black shadow-sm transition-colors hover:bg-brand-400 lg:h-11 lg:px-5"
        aria-expanded={desktopCartDrawerOpen}
        aria-haspopup="dialog"
        aria-controls="desktop-cart-drawer-panel"
        onClick={() => {
          closeDesktopWishlistDrawer();
          openDesktopCartDrawer();
        }}
      >
        <CartGlyph className="h-[18px] w-[18px]" />
        <span>سلة التسوق</span>
        {totalItems > 0 ? (
          <span className="absolute -top-1.5 -end-1.5 inline-flex min-h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-brand-400">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        ) : null}
      </button>
    </div>
  );

  const mobileWishlistButton = (
    <button
      type="button"
      className={cn(mobileCommerceIconOrbClass)}
      aria-label="المفضلة"
      aria-expanded={desktopWishlistDrawerOpen}
      aria-haspopup="dialog"
      aria-controls="desktop-wishlist-drawer-panel"
      onClick={() => {
        closeDesktopCartDrawer();
        openDesktopWishlistDrawer();
      }}
    >
      <WishlistHeartGlyph className="h-[18px] w-[18px]" />
      {wishlistCount > 0 ? (
        <span className="absolute -top-1 -end-1 inline-flex min-h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-brand-500 px-0.5 text-[9px] font-bold text-black">
          {wishlistCount > 99 ? "99+" : wishlistCount}
        </span>
      ) : null}
    </button>
  );

  const mobileLeading = isCheckout ? (
    <Link
      href={ROUTES.CART}
      className={mobileCheckoutBackOrbClass}
      aria-label="العودة إلى السلة"
    >
      <BackIcon />
    </Link>
  ) : isAbout ? (
    mobileWishlistButton
  ) : (
    <MobileStoreHotline layout="premium" />
  );

  const mobileWordmark = isAbout ? (
    <Link
      href={ROUTES.HOME}
      className="flex min-w-0 flex-col items-center gap-1"
      onClick={() => closeDrawer()}
    >
      {showHeaderWordmarkText ? (
        <span
          className={cn(
            headerBrandTextClass,
            "text-center text-base sm:text-lg",
          )}
        >
          {siteName}
        </span>
      ) : (
        <div className={headerLogoImageBoxMobileClass}>
          <AppImage
            src={logoPath}
            alt={siteName}
            fill
            sizes={headerLogoImageSizesMobile}
            className="object-contain"
            priority={logoImagePriority}
            fetchPriority={isHome ? "low" : "high"}
            usePlaceholderOnError={false}
            onLoadError={() => setLogoLoadFailed(true)}
          />
        </div>
      )}
    </Link>
  ) : (
    <Link
      href={ROUTES.HOME}
      className="flex min-w-0 justify-center"
      onClick={() => closeDrawer()}
    >
      {showHeaderWordmarkText ? (
        <span
          className={cn(
            headerBrandTextClass,
            "text-center text-base sm:text-lg",
          )}
        >
          {siteName}
        </span>
      ) : (
        <div className={headerLogoImageBoxMobileClass}>
          <AppImage
            src={logoPath}
            alt={siteName}
            fill
            sizes={headerLogoImageSizesMobile}
            className="object-contain"
            priority={logoImagePriority}
            fetchPriority={isHome ? "low" : "high"}
            usePlaceholderOnError={false}
            onLoadError={() => setLogoLoadFailed(true)}
          />
        </div>
      )}
    </Link>
  );

  const mobileSearchButton = (
    <button
      type="button"
      className={cn(mobileCommerceIconOrbClass)}
      aria-label="بحث في المنتجات"
      onClick={() => openSearchOverlay()}
    >
      <Search className="h-[18px] w-[18px]" strokeWidth={2.05} aria-hidden />
    </button>
  );

  const mobileTrailing = isAbout ? (
    <MobileCartLink totalItems={totalItems} />
  ) : (
    <div className="flex items-center gap-1.5">
      {mobileSearchButton}
      {mobileWishlistButton}
    </div>
  );

  const desktopSearch = (
    <Suspense fallback={<NavbarSearchRowSkeleton />}>
      <NavbarSearch quickKeywords={searchQuickKeywords} />
    </Suspense>
  );

  const mobileSecondary =
    pathname === ROUTES.HOME
      ? undefined
      : isServiceCenters ? (
          <span className="whitespace-normal">اعثر على أقرب مركز خدمة</span>
        ) : isRetailers ? (
          <span className="whitespace-normal">موزعون معتمدون من الوكيل</span>
        ) : isAbout ? (
          <span className="whitespace-normal">جودة أصلية · تجربة واضحة</span>
        ) : undefined;

  return (
    <>
      <TopHeader
        logo={logo}
        center={desktopSearch}
        desktopSubheader={desktopSubheader}
        trailing={trailing}
        mobileWordmark={mobileWordmark}
        mobileLeading={mobileLeading}
        mobileTrailing={mobileTrailing}
        mobileToolbarBelow={!isCheckout ? <MobileStorefrontHeaderToolbar /> : undefined}
        mobileSecondary={mobileSecondary}
        mobileTopRowCollapsed={!isCheckout && mobileTopRowHidden}
      />
      {!isCheckout && (open || mobileDrawerEverOpen) ? (
        <MobileNavDrawer
          open={open}
          onClose={closeDrawer}
          returnFocusRef={mobileNavDrawerReturnFocusRef}
          linkSections={mobileDrawerLinkSections}
          policyLinks={servicesDropdownLinks}
          categories={navCategories}
          categoriesLoading={categoriesQuery.isLoading}
        />
      ) : null}
    </>
  );
}

function CartGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M6 6h15l-1.5 9h-12z" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

function WishlistHeartGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M12 21s-7-4.35-9.33-8.15A5.65 5.65 0 0112 5a5.65 5.65 0 019.33 7.85C19 16.65 12 21 12 21z" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      className="rtl:rotate-180"
      aria-hidden
    >
      <path d="M14 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
