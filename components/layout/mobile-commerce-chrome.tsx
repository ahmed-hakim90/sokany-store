"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { MobileCartBottomSheet } from "@/features/cart/components/MobileCartBottomSheet";
import { useCart } from "@/hooks/useCart";
import { ROUTES } from "@/lib/constants";
import { BottomNavInner } from "@/components/layout/bottom-nav";

const MOBILE_COMMERCE_CHROME_HEIGHT_VAR = "--mobile-commerce-chrome-height";

export function MobileCommerceChrome() {
  const pathname = usePathname();
  const { totalItems } = useCart();
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
  }, [pathname, showCartSummary]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 md:hidden"
      style={{
        paddingBottom: "max(0.65rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="pointer-events-auto mx-auto max-w-lg overflow-hidden rounded-t-2xl bg-white shadow-[0_-8px_28px_-10px_rgba(15,23,42,0.18),0_-1px_0_rgba(15,23,42,0.08)] ring-1 ring-slate-900/[0.06]">
        <MobileCartBottomSheet showCartSummary={showCartSummary} />
        <BottomNavInner />
      </div>
    </div>
  );
}
