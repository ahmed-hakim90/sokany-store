"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AppImage } from "@/components/AppImage";
import { TopHeader } from "@/components/layout/top-header";
import { IconButton } from "@/components/ui/icon-button";
import { useCart } from "@/hooks/useCart";
import { ROUTES, SITE_NAME, SITE_WORDMARK } from "@/lib/constants";
import { cn } from "@/lib/utils";

const links = [
  { href: ROUTES.HOME, label: "الرئيسية" },
  { href: ROUTES.PRODUCTS, label: "المنتجات" },
  { href: ROUTES.CATEGORIES, label: "التصنيفات" },
  { href: ROUTES.ABOUT, label: "من نحن" },
  { href: ROUTES.SERVICE_CENTERS, label: "الفروع" },
];

const mobileIconTapClass =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-brand-900/50 transition-colors hover:bg-surface-muted/45 hover:text-brand-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500";

const mobileIconSvgClass = "h-[17px] w-[17px] shrink-0 stroke-[1.45]";

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
        "relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/80 bg-white text-brand-950 shadow-sm transition-colors hover:bg-surface-muted/50",
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
  const { totalItems } = useCart();

  const isCheckout = pathname === ROUTES.CHECKOUT;
  const isAbout = pathname === ROUTES.ABOUT;
  const isServiceCenters =
    pathname === ROUTES.SERVICE_CENTERS || pathname.startsWith(`${ROUTES.SERVICE_CENTERS}/`);

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
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="text-sm font-medium text-muted-foreground hover:text-brand-900"
        >
          {l.label}
        </Link>
      ))}
    </>
  );

  const trailing = (
    <Link
      href={ROUTES.CART}
      className="relative hidden h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-white text-brand-950 shadow-sm transition-colors hover:bg-surface-muted/50 md:inline-flex md:h-10 md:w-10"
      aria-label="السلة"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[18px] w-[18px] md:h-5 md:w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        <path d="M6 6h15l-1.5 9h-12z" />
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </svg>
      {totalItems > 0 ? (
        <span className="absolute -top-1 -end-1 inline-flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-black">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      ) : null}
    </Link>
  );

  const menuIconButtonClass =
    "h-8 w-8 text-brand-900/50 hover:bg-surface-muted/45 hover:text-brand-950 [&_svg]:h-[17px] [&_svg]:w-[17px] [&_svg]:stroke-[1.45]";

  const mobileMenuButton = (
    <IconButton
      type="button"
      variant="ghost"
      size="sm"
      aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
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
    <Link href={ROUTES.PRODUCTS} className={mobileIconTapClass} aria-label="بحث">
      <svg viewBox="0 0 24 24" className={mobileIconSvgClass} fill="none" stroke="currentColor" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3-3" strokeLinecap="round" />
      </svg>
    </Link>
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
      className="block truncate font-display text-[0.9375rem] font-semibold tracking-[0.03em] text-brand-950 sm:text-base"
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

  const mobilePanel = (
    <nav className="flex flex-col gap-1">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="rounded-md px-2 py-2 text-sm font-medium text-brand-950 hover:bg-surface-muted/80"
          onClick={() => setOpen(false)}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <TopHeader
      logo={logo}
      desktopNav={desktopNav}
      trailing={trailing}
      mobileWordmark={mobileWordmark}
      mobileLeading={mobileLeading}
      mobileTrailing={mobileTrailing}
      mobileSecondary={mobileSecondary}
      mobilePanel={mobilePanel}
      mobilePanelOpen={open}
    />
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
