"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useLayoutEffect, useRef } from "react";
import { useMobileChromeCollapsedStore } from "@/components/layout/mobile-chrome-collapsed-store";
import { useCart } from "@/hooks/useCart";
import { ROUTES } from "@/lib/constants";
import { BottomNavInner } from "@/components/layout/bottom-nav";
import {
  mobileCommerceBottomNavCapsuleClassName,
  mobileCommerceChromeColumnClass,
} from "@/components/layout/mobile-commerce-surface";
import { cn } from "@/lib/utils";

const MobileCartBottomSheet = dynamic(
  () =>
    import("@/features/cart/components/MobileCartBottomSheet").then(
      (m) => m.MobileCartBottomSheet,
    ),
  { ssr: false, loading: () => null },
);

const MOBILE_COMMERCE_CHROME_HEIGHT_VAR = "--mobile-commerce-chrome-height";
const MOBILE_COMMERCE_FLOATING_ACTIONS_BOTTOM_VAR =
  "--mobile-commerce-floating-actions-bottom";

export function MobileCommerceChrome() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const headerHidden = useMobileChromeCollapsedStore((s) => s.headerHidden);
  const cartPeekHidden = useMobileChromeCollapsedStore((s) => s.cartPeekHidden);
  const rootRef = useRef<HTMLDivElement>(null);
  const bottomNavRef = useRef<HTMLDivElement>(null);
  const reservedHeightRef = useRef(0);
  const reservedHeightKeyRef = useRef("");

  const hideFloatingCart =
    pathname === ROUTES.CART || pathname === ROUTES.CHECKOUT;

  const showCartSummary = totalItems > 0 && !hideFloatingCart;

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const reservedHeightKey = `${pathname}:${showCartSummary}`;
    if (reservedHeightKeyRef.current !== reservedHeightKey) {
      reservedHeightRef.current = 0;
      reservedHeightKeyRef.current = reservedHeightKey;
    }

    const syncHeight = () => {
      const measuredHeight = Math.ceil(el.getBoundingClientRect().height);
      const h = showCartSummary
        ? Math.max(reservedHeightRef.current, measuredHeight)
        : measuredHeight;
      const bottomNavTop = bottomNavRef.current?.getBoundingClientRect().top;
      const bottomNavBase =
        bottomNavTop != null
          ? Math.max(0, Math.ceil(window.innerHeight - bottomNavTop))
          : 76;
      const floatingActionsBottom =
        showCartSummary && !cartPeekHidden ? measuredHeight : bottomNavBase;

      reservedHeightRef.current = h;
      document.documentElement.style.setProperty(
        MOBILE_COMMERCE_CHROME_HEIGHT_VAR,
        `${h}px`,
      );
      document.documentElement.style.setProperty(
        MOBILE_COMMERCE_FLOATING_ACTIONS_BOTTOM_VAR,
        `${floatingActionsBottom}px`,
      );
    };

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(syncHeight);
    });
    ro.observe(el);
    if (bottomNavRef.current) {
      ro.observe(bottomNavRef.current);
    }
    window.addEventListener("resize", syncHeight);
    syncHeight();

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", syncHeight);
      document.documentElement.style.removeProperty(
        MOBILE_COMMERCE_CHROME_HEIGHT_VAR,
      );
      document.documentElement.style.removeProperty(
        MOBILE_COMMERCE_FLOATING_ACTIONS_BOTTOM_VAR,
      );
    };
  }, [pathname, showCartSummary, cartPeekHidden]);

  return (
    <div
      ref={rootRef}
      data-mobile-commerce-chrome
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div
        className={cn(
          "pointer-events-auto flex flex-col gap-3",
          mobileCommerceChromeColumnClass,
        )}
      >
        {showCartSummary ? (
          <MobileCartBottomSheet
            showCartSummary={showCartSummary}
            peekHidden={cartPeekHidden}
          />
        ) : null}
        <div
          ref={bottomNavRef}
          className={mobileCommerceBottomNavCapsuleClassName(headerHidden)}
        >
          <BottomNavInner />
        </div>
      </div>
    </div>
  );
}
