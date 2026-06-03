"use client";

/**
 * شريط التنقل السفلي — مبيعات Sokany (‎‎`lg:hidden`‎).
 *
 * المعالم: خمس خانات — (‎`/‎` · التصنيفات · السلة · طلباتي · زر المزيد يفتح ‎`MobileNavDrawer`) بترتيب DOM يحقق قراءة RTL من الطرف المرئي «اليمين لليسار».
 * علامات العد وبقية منطق الـ peek تبقى من ‎`useCart`‎ / ‎`useMobileChromeCollapsedStore`‎.
 */
import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  Home,
  LayoutGrid,
  MapPin,
  Menu,
  ShoppingCart,
} from "lucide-react";
import { Link } from "next-view-transitions";
import { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import {
  mobileNavDrawerReturnFocusRef,
  useMobileNavDrawerOpenStore,
} from "@/components/layout/mobile-nav-drawer-open-store";
import { useMobileChromeCollapsedStore } from "@/components/layout/mobile-chrome-collapsed-store";
import { useCart } from "@/hooks/useCart";
import { ROUTES } from "@/lib/constants";
import { bottomNavItemPressableClass } from "@/lib/nav-link-interaction";
import { cn } from "@/lib/utils";

const linkItems = [
  { href: ROUTES.HOME, label: "الرئيسية", key: "home" },
  { href: ROUTES.PRODUCTS, label: "المنتجات", key: "products" },
  { href: ROUTES.SERVICE_CENTERS, label: "الفروع", key: "branches" },
  { href: ROUTES.ABOUT, label: "عن سوكاني", key: "about" },
] as const;

type NavLinkKey = (typeof linkItems)[number]["key"];

const iconByKey: Record<NavLinkKey, LucideIcon> = {
  home: Home,
  products: LayoutGrid,
  branches: MapPin,
  about: ClipboardList,
};

const iconGlyphClass =
  "h-5 w-5 shrink-0 stroke-[2.35] motion-reduce:transition-none";

const bottomNavLabelClass =
  "line-clamp-1 text-center text-xs font-bold leading-tight tracking-[-0.01em]";

function tabIsActive(pathname: string | null, key: NavLinkKey, href: string) {
  const p = pathname ?? "";
  if (key === "home") return p === ROUTES.HOME;
  if (key === "products") {
    return (
      p === ROUTES.PRODUCTS || p.startsWith(`${ROUTES.PRODUCTS}/`)
    );
  }
  if (key === "cart") {
    return p === href || p.startsWith(`${href}/`);
  }
  /* orders */
  return p === ROUTES.MY_ORDERS || p.startsWith(`${ROUTES.MY_ORDERS}/`);
}

function BottomNavLinkContents({
  active,
  isCart,
  totalItems,
  label,
  Icon,
  tabIconShellClassName,
}: {
  active: boolean;
  isCart: boolean;
  totalItems: number;
  label: string;
  Icon: LucideIcon;
  tabIconShellClassName: (a: boolean) => string;
}) {
  const { pending } = useLinkStatus();
  return (
    <span
      className={cn(
        "flex w-full min-w-0 max-w-full flex-1 flex-col items-center justify-center gap-0.5",
        pending && "opacity-50",
      )}
    >
      <span className={tabIconShellClassName(active)}>
        <Icon className={iconGlyphClass} aria-hidden />
        {isCart && totalItems > 0 ? (
          <span
            className={cn(
              "absolute -end-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-brand-500 px-0.5 text-[8px] font-bold leading-none text-black ring-[2px]",
              active ? "ring-brand-200" : "ring-white/92",
            )}
          >
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        ) : null}
      </span>
      <span
        className={cn(bottomNavLabelClass, active ? "text-brand-950" : "text-current")}
      >
        {label}
      </span>
    </span>
  );
}

/**
 * Bottom tab row for mobile commerce chrome.
 * Fixed positioning and safe-area padding live in `MobileCommerceChrome`.
 */
export function BottomNavInner() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const headerHidden = useMobileChromeCollapsedStore((s) => s.headerHidden);

  const menuRef = useRef<HTMLButtonElement>(null);
  const drawerOpen = useMobileNavDrawerOpenStore((s) => s.open);
  const openDrawer = useMobileNavDrawerOpenStore((s) => s.openDrawer);

  const tabClass = (active: boolean) =>
    cn(
      "flex min-h-[3rem] w-full flex-col items-center justify-center gap-0.5 rounded-none border-transparent px-[2px] py-0.5 text-xs font-bold leading-tight outline-none ring-1 ring-transparent transition-[color,background-color,filter] duration-200 ease-out active:brightness-[0.97] motion-reduce:transition-none",
      active
        ? "text-brand-950"
        : headerHidden
          ? "text-brand-950/75 [@media(hover:hover)]:hover:bg-black/[0.04] [@media(hover:hover)]:hover:text-brand-950"
          : "text-slate-500 [@media(hover:hover)]:hover:bg-black/[0.03] [@media(hover:hover)]:hover:text-slate-900",
    );

  const tabIconShellClass = (active: boolean) =>
    cn(
      "relative inline-flex h-8 min-w-9 max-w-none items-center justify-center rounded-lg px-1 text-current motion-reduce:transition-none",
      active
        ? "bg-brand text-brand-950 shadow-[0_6px_16px_-8px_rgba(15,23,42,0.45)] ring-1 ring-brand-600/30"
        : "bg-transparent text-current",
      "transition-[background-color,color,box-shadow] duration-200 ease-out motion-reduce:transition-none",
    );

  return (
    <nav aria-label="التنقل السفلي" className="bg-brand-500/50">
      <ul className="flex w-full touch-pan-x items-start justify-between gap-0 px-2 py-1 sm:px-3 md:justify-evenly md:gap-1">
        {linkItems.map(({ href, label, key }) => {
          const Icon = iconByKey[key];
          const active = tabIsActive(pathname, key, href);
          const isCart = key === "cart";

          return (
            <li key={key} className="flex min-w-0 flex-[1_1_0] justify-center md:max-w-[5.85rem]">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                aria-label={label}
                className={cn(
                  tabClass(active),
                  bottomNavItemPressableClass,
                  "w-full min-w-0 max-w-none rounded-xl",
                  "focus-visible:ring-brand-400/95",
                )}
                {...(isCart ? { "data-cart-fly-target": "mobile" as const } : {})}
              >
                <BottomNavLinkContents
                  active={active}
                  isCart={isCart}
                  totalItems={totalItems}
                  label={label}
                  Icon={Icon}
                  tabIconShellClassName={tabIconShellClass}
                />
              </Link>
            </li>
          );
        })}
        <li className="flex min-w-0 flex-[1_1_0] justify-center md:max-w-[5.85rem]">
          <button
            ref={menuRef}
            type="button"
            aria-expanded={drawerOpen}
            aria-haspopup="dialog"
            aria-label="فتح قائمة المزيد"
            className={cn(
              tabClass(drawerOpen),
              bottomNavItemPressableClass,
              "w-full min-w-0 max-w-none rounded-xl",
              "focus-visible:ring-brand-400/95",
            )}
            onClick={() => {
              mobileNavDrawerReturnFocusRef.current = menuRef.current;
              openDrawer();
            }}
          >
            {/* أيقونة المزيد: بدون انتقال route؛ المحتوى يعكس حالة الفتح لا pending */}
            <span
              className={cn(
                "flex w-full min-w-0 max-w-full flex-1 flex-col items-center justify-center gap-0.5",
              )}
            >
              <span className={tabIconShellClass(drawerOpen)}>
                <Menu className={iconGlyphClass} aria-hidden />
              </span>
              <span
                className={cn(
                  bottomNavLabelClass,
                  drawerOpen ? "text-brand-950" : "text-current",
                )}
              >
                المزيد
              </span>
            </span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
