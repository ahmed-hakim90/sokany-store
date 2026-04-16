"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const items = [
  { href: ROUTES.HOME, label: "الرئيسية", key: "home", icon: HomeIcon },
  {
    href: ROUTES.CATEGORIES,
    label: "الأقسام",
    key: "categories",
    icon: GridIcon,
  },
  { href: ROUTES.CART, label: "السلة", key: "cart", icon: CartIcon },
  {
    href: ROUTES.SERVICE_CENTERS,
    label: "الفروع",
    key: "service",
    icon: MapPinIcon,
  },
  { href: ROUTES.ACCOUNT, label: "حسابي", key: "account", icon: UserIcon },
] as const;

/**
 * Bottom tab row for mobile commerce chrome.
 * Fixed positioning and safe-area padding live in `MobileCommerceChrome`.
 */
export function BottomNavInner() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  return (
    <nav aria-label="التنقل السفلي" className="bg-white">
      <ul className="mx-auto flex max-w-lg items-center justify-between gap-0 px-1.5 pb-1 pt-1">
        {items.map(({ href, label, key, icon: Icon }) => {
          const active =
            key === "home"
              ? pathname === ROUTES.HOME
              : pathname === href || pathname.startsWith(`${href}/`);
          const isCart = key === "cart";

          return (
            <li key={key} className="flex min-w-0 flex-1 justify-center">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex w-full max-w-[4.5rem] flex-col items-center gap-0.5 rounded-full px-1 py-1 text-[9px] font-semibold leading-tight transition-[color,background-color,box-shadow] duration-200",
                  active
                    ? "bg-brand-950 text-brand-200 shadow-inner ring-1 ring-brand-500/35"
                    : "text-muted-foreground hover:text-foreground/55",
                )}
              >
                <span className="relative inline-flex">
                  <Icon />
                  {isCart && totalItems > 0 ? (
                    <span className="absolute -end-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-brand-500 px-0.5 text-[8px] font-bold leading-none text-black">
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  ) : null}
                </span>
                <span className="line-clamp-1 text-center">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const iconClass =
  "h-3.5 w-3.5 shrink-0 stroke-[1.45] text-current";

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

/** Store / branch pin — lighter visual than a chunky headset glyph */
function MapPinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className={iconClass}
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <path d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10z" />
      <circle cx="12" cy="11" r="2" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className={iconClass}
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <path d="M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
    </svg>
  );
}
