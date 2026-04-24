"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { useMobileChromeCollapsedStore } from "@/components/layout/mobile-chrome-collapsed-store";
import {
  mobileNavDrawerReturnFocusRef,
  useMobileNavDrawerOpenStore,
} from "@/components/layout/mobile-nav-drawer-open-store";
import { useCart } from "@/hooks/useCart";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const linkItems = [
  { href: ROUTES.HOME, label: "الرئيسية", key: "home", icon: HomeIcon },
  { href: ROUTES.SEARCH, label: "بحث", key: "search", icon: SearchIcon },
  {
    href: ROUTES.CATEGORIES,
    label: "الأقسام",
    key: "categories",
    icon: GridIcon,
  },
  { href: ROUTES.CART, label: "السلة", key: "cart", icon: CartIcon },
  {
    href: ROUTES.ABOUT,
    label: "عن سوكاني",
    key: "about",
    icon: InfoIcon,
  },
] as const;

const mainMenuItem = {
  label: "القائمة الرئيسية",
  key: "main-menu",
  icon: ListIcon,
} as const;

/**
 * Bottom tab row for mobile commerce chrome.
 * Fixed positioning and safe-area padding live in `MobileCommerceChrome`.
 */
export function BottomNavInner() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const mainMenuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerOpen = useMobileNavDrawerOpenStore((s) => s.open);
  const openDrawer = useMobileNavDrawerOpenStore((s) => s.openDrawer);
  const cartPeekHidden = useMobileChromeCollapsedStore((s) => s.cartPeekHidden);
  const showCartPeekOnly = useMobileChromeCollapsedStore(
    (s) => s.showCartPeekOnly,
  );
  const isCheckout = pathname === ROUTES.CHECKOUT;

  const tabClass = (active: boolean) =>
    cn(
      "flex h-14 w-full max-w-[4.85rem] flex-col items-center justify-center gap-1 rounded-2xl border border-transparent px-0.5 py-1.5 text-[11px] font-semibold leading-tight transition-colors duration-200 sm:max-w-[5.25rem] sm:text-xs",
      active
        ? "border-brand-950 bg-brand-950 text-accent"
        : "text-muted-foreground hover:bg-black/[0.03] hover:text-foreground/80",
    );

  const tabIconShellClass = (active: boolean) =>
    cn(
      "relative inline-flex text-current",
      active
        ? "drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]"
        : "drop-shadow-[0_1px_1.5px_rgba(15,23,42,0.2)]",
    );

  return (
    <nav
      aria-label="التنقل السفلي"
      className="bg-transparent"
    >
      <ul className="mx-auto flex w-full max-w-none items-center justify-between gap-0 px-0 py-1.5 sm:px-0.5">
        {linkItems.map(({ href, label, key, icon: Icon }) => {
          const active =
            key === "home"
              ? pathname === ROUTES.HOME
              : key === "search"
                ? pathname === ROUTES.SEARCH || pathname.startsWith(`${ROUTES.SEARCH}/`)
                : pathname === href || pathname.startsWith(`${href}/`);
          const isCart = key === "cart";

          return (
            <li key={key} className="flex min-w-0 flex-1 justify-center">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={tabClass(active)}
                {...(isCart ? { "data-cart-fly-target": "mobile" as const } : {})}
                onClick={(e) => {
                  if (isCart && cartPeekHidden) {
                    e.preventDefault();
                    showCartPeekOnly();
                  }
                }}
              >
                <span className={tabIconShellClass(active)}>
                  <Icon />
                  {isCart && totalItems > 0 ? (
                    <span
                      className={cn(
                        "absolute-end-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-brand-500 px-0.5 text-[8px] font-bold leading-none text-black ring-2",
                        active ? "ring-brand-950" : "ring-white",
                      )}
                    >
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  ) : null}
                </span>
                <span className="line-clamp-1 text-center">{label}</span>
              </Link>
            </li>
          );
        })}
        <li className="flex min-w-0 flex-1 justify-center">
          <button
            ref={mainMenuButtonRef}
            type="button"
            disabled={isCheckout}
            aria-expanded={drawerOpen}
            aria-haspopup="dialog"
            aria-label={mainMenuItem.label}
            className={cn(
              tabClass(drawerOpen && !isCheckout),
              isCheckout && "pointer-events-none opacity-40",
            )}
            onClick={() => {
              mobileNavDrawerReturnFocusRef.current = mainMenuButtonRef.current;
              openDrawer();
            }}
          >   
            <span
              className={tabIconShellClass(Boolean(drawerOpen && !isCheckout))}
            >
              <ListIcon />
            </span>
            <span className="line-clamp-1 text-center">{mainMenuItem.label}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

/** Slightly larger + stronger stroke on small screens for legibility; shadow lives on parent shell. */
const iconClass =
  "h-5 w-5 shrink-0 stroke-2 text-current sm:h-4 sm:w-4 sm:stroke-[1.5]";

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className={iconClass}
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className={iconClass}
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" strokeLinecap="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className={iconClass}
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <path d="M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className={iconClass}
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <path d="M6 6h15l-1.5 9h-12z" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className={iconClass}
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v8M12 7h.01" strokeLinecap="round" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className={iconClass}
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <path d="M8 6h13M8 12h13M8 18h13" strokeLinecap="round" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" strokeLinecap="round" />
    </svg>
  );
}
