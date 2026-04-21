"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useMobileChromeCollapsedStore } from "@/components/layout/mobile-chrome-collapsed-store";
import { MobileCartBottomSheet } from "@/features/cart/components/MobileCartBottomSheet";
import { useCart } from "@/hooks/useCart";
import { ROUTES } from "@/lib/constants";
import { BottomNavInner } from "@/components/layout/bottom-nav";

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
      <div className="pointer-events-auto mx-auto flex w-full max-w-3xl flex-col gap-3 md:max-w-5xl">
        <MobileCartBottomSheet
          showCartSummary={showCartSummary}
          peekHidden={cartPeekHidden}
        />
        <div className="overflow-hidden rounded-t-2xl border border-white/40 bg-white/80 px-2 shadow-[0_-8px_32px_-12px_rgba(15,23,42,0.14),0_-1px_0_rgba(255,255,255,0.45)_inset] ring-1 ring-slate-900/[0.05] backdrop-blur-xl backdrop-saturate-150 sm:px-4 md:px-5">
          <BottomNavInner />
        </div>
      </div>
    </div>
  );
}
