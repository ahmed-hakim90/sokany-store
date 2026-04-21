"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useMobileChromeCollapsedStore } from "@/components/layout/mobile-chrome-collapsed-store";
import { MobileCartBottomSheet } from "@/features/cart/components/MobileCartBottomSheet";
import { useCart } from "@/hooks/useCart";
import { ROUTES } from "@/lib/constants";
import { BottomNavInner } from "@/components/layout/bottom-nav";
import {
  mobileCommerceBottomNavCapsuleClassName,
  mobileCommerceChromeColumnClass,
} from "@/components/layout/mobile-commerce-surface";
import { cn } from "@/lib/utils";

const MOBILE_COMMERCE_CHROME_HEIGHT_VAR = "--mobile-commerce-chrome-height";

export function MobileCommerceChrome() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const cartPeekHidden = useMobileChromeCollapsedStore((s) => s.cartPeekHidden);
  const rootRef = useRef<HTMLDivElement>(null);

  const hideFloatingCart =
    pathname === ROUTES.CART || pathname === ROUTES.CHECKOUT;

  const showCartSummary = totalItems > 0 && !hideFloatingCart;

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const syncHeight = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty(
        MOBILE_COMMERCE_CHROME_HEIGHT_VAR,
        `${h}px`,
      );
    };

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(syncHeight);
    });
    ro.observe(el);
    syncHeight();

    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty(
        MOBILE_COMMERCE_CHROME_HEIGHT_VAR,
      );
    };
  }, [pathname, showCartSummary, cartPeekHidden]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div
        className={cn(
          "pointer-events-auto flex flex-col gap-3",
          mobileCommerceChromeColumnClass,
        )}
      >
        <MobileCartBottomSheet
          showCartSummary={showCartSummary}
          peekHidden={cartPeekHidden}
        />
        <div className={mobileCommerceBottomNavCapsuleClassName()}>
          <BottomNavInner />
        </div>
      </div>
    </div>
  );
}
