"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { AppImage } from "@/components/AppImage";
import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer";
import { MobileStoreHotline } from "@/components/layout/mobile-store-hotline";
import { NavbarSearch } from "@/components/layout/navbar-search";
import { TopHeader } from "@/components/layout/top-header";
import { IconButton } from "@/components/ui/icon-button";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useCartDrawerOpenStore } from "@/features/cart/store/useCartDrawerOpenStore";
import { useWishlistDrawerOpenStore } from "@/features/wishlist/store/useWishlistDrawerOpenStore";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { ROUTES, SITE_NAME, SITE_WORDMARK } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Primary strip (desktop) + top of drawer — matches storefront reference. */
const primaryNavLinks = [
  { href: ROUTES.HOME, label: "الرئيسية" },
  { href: ROUTES.CATEGORY("home-appliances"), label: "الأجهزة المنزلية" },
  { href: ROUTES.CATEGORY("kitchen-supplies"), label: "المطبخ" },
  { href: ROUTES.CATEGORY("personal-care"), label: "العناية الشخصية" },
  { href: ROUTES.PRODUCTS, label: "العروض" },
] as const;

const drawerExtraLinks = [
  { href: ROUTES.CATEGORIES, label: "كل التصنيفات" },
  { href: ROUTES.ABOUT, label: "من نحن" },
  { href: ROUTES.SERVICE_CENTERS, label: "الفروع" },
] as const;

const drawerLinks = [...primaryNavLinks, ...drawerExtraLinks] as const;

const mobileIconTapClass =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-brand-900/50 transition-colors hover:bg-surface-muted/45 hover:text-brand-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500";

function MobileCartLink({
  totalItems,
  className,
}: {
  totalItems: number;
  className?: string;
}) {
  return (
    <Link
      href={ROUTES.CART}
      className={cn(
        "relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-white text-brand-950 shadow-sm transition-colors hover:bg-surface-muted/50",
        className,
      )}
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

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { totalItems } = useCart();
  const { totalCount: wishlistCount } = useWishlist();
  const categoriesQuery = useCategories();
  const openDesktopCartDrawer = useCartDrawerOpenStore((s) => s.openDrawer);
  const closeDesktopCartDrawer = useCartDrawerOpenStore((s) => s.closeDrawer);
  const desktopCartDrawerOpen = useCartDrawerOpenStore((s) => s.open);
  const openDesktopWishlistDrawer = useWishlistDrawerOpenStore((s) => s.openDrawer);
  const closeDesktopWishlistDrawer = useWishlistDrawerOpenStore((s) => s.closeDrawer);
  const desktopWishlistDrawerOpen = useWishlistDrawerOpenStore((s) => s.open);

  const isCheckout = pathname === ROUTES.CHECKOUT;
  const isAbout = pathname === ROUTES.ABOUT;
  const isServiceCenters =
    pathname === ROUTES.SERVICE_CENTERS ||
    pathname.startsWith(`${ROUTES.SERVICE_CENTERS}/`);

  const logo = (
    <Link href={ROUTES.HOME} className="flex items-center gap-2.5">
      <div className="relative h-8 w-8 overflow-hidden rounded-md border border-border bg-image-well sm:h-9 sm:w-9">
        <AppImage src="/images/logo.png" alt={SITE_NAME} fill sizes="36px" />
      </div>
      <span className="font-display text-base font-semibold text-brand-950 sm:text-lg">
        {SITE_NAME}
      </span>
    </Link>
  );

  const desktopNav = (
    <>
      {primaryNavLinks.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="text-muted-foreground transition-colors hover:text-brand-950"
        >
          {l.label}
        </Link>
      ))}
    </>
  );

  const trailing = (
    <div className="hidden items-center gap-2 md:flex">
      <Link
        href={ROUTES.ACCOUNT}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-white text-brand-950 shadow-sm transition-colors hover:bg-surface-muted/50"
        aria-label="حسابي"
      >
        <UserGlyph className="h-[18px] w-[18px]" />
      </Link>
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

  const menuIconButtonClass =
    "h-11 w-11 min-h-11 min-w-11 text-brand-900/50 hover:bg-surface-muted/45 hover:text-brand-950 [&_svg]:h-[17px] [&_svg]:w-[17px] [&_svg]:stroke-[1.45]";

  const mobileMenuButton = (
    <IconButton
      ref={menuButtonRef}
      type="button"
      variant="ghost"
      size="sm"
      aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
      aria-expanded={open}
      aria-haspopup="dialog"
      className={menuIconButtonClass}
      onClick={() => setOpen((v) => !v)}
    >
      {open ? <CloseIcon /> : <MenuIcon />}
    </IconButton>
  );

  const mobileLeading = isCheckout ? (
    <Link
      href={ROUTES.CART}
      className={mobileIconTapClass}
      aria-label="العودة إلى السلة"
    >
      <BackIcon />
    </Link>
  ) : isAbout ? (
    mobileMenuButton
  ) : (
    <MobileStoreHotline />
  );

  const mobileWordmark = isCheckout ? (
    <span className="block truncate text-center font-display text-[0.9375rem] font-semibold tracking-tight text-brand-950 sm:text-base">
      {SITE_NAME}
    </span>
  ) : isAbout ? (
    <Link
      href={ROUTES.HOME}
      className="flex min-w-0 flex-col items-center gap-1"
      onClick={() => setOpen(false)}
    >
      <div className="relative h-8 w-8 overflow-hidden rounded-md border border-border bg-image-well">
        <AppImage src="/images/logo.png" alt={SITE_NAME} fill sizes="32px" />
      </div>
      <span className="truncate font-display text-[0.8125rem] font-semibold leading-tight text-brand-950 sm:text-[0.875rem]">
        {SITE_NAME}
      </span>
    </Link>
  ) : (
    <Link
      href={ROUTES.HOME}
      className="block truncate font-display text-[0.9375rem] font-semibold tracking-[0.04em] text-brand-950 sm:text-base"
      onClick={() => setOpen(false)}
    >
      {SITE_WORDMARK}
    </Link>
  );

  const mobileTrailing = isAbout ? (
    <MobileCartLink totalItems={totalItems} />
  ) : (
    mobileMenuButton
  );

  const mobileSecondary =
    pathname === ROUTES.HOME ? (
      <span className="flex flex-wrap items-center justify-center gap-x-4 gap-y-0.5">
        <span className="whitespace-nowrap">وكيل معتمد</span>
        <span className="whitespace-nowrap">شحن لكل مصر</span>
      </span>
    ) : isServiceCenters ? (
      <span className="whitespace-normal">اعثر على أقرب مركز خدمة</span>
    ) : isAbout ? (
      <span className="whitespace-normal">جودة أصلية · تجربة واضحة</span>
    ) : undefined;

  return (
    <>
      <TopHeader
        logo={logo}
        center={<NavbarSearch />}
        desktopNav={desktopNav}
        trailing={trailing}
        mobileWordmark={mobileWordmark}
        mobileLeading={mobileLeading}
        mobileTrailing={mobileTrailing}
        mobileToolbarBelow={isCheckout ? undefined : <NavbarSearch />}
        mobileSecondary={mobileSecondary}
      />
      {!isCheckout ? (
        <MobileNavDrawer
          open={open}
          onClose={() => setOpen(false)}
          returnFocusRef={menuButtonRef}
          links={drawerLinks}
          categories={categoriesQuery.data}
          categoriesLoading={categoriesQuery.isLoading}
        />
      ) : null}
    </>
  );
}

function UserGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" />
      <circle cx="12" cy="7" r="4" />
    </svg>
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

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
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
