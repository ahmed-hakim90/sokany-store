"use client";

/**
 * كروم التجارة للموبايل
 * بالعامية: عمود ثابت تحت المحتوى — كبسولة سلة حمراء (طالما في أصناف) ثم bottom nav؛ ارتفاع محجوز بـ CSS variable للـ toast والـ floating actions.
 *
 * تخطيط (max-lg):
 * - عمود fixed أسفل الشاشة: [كبسولة سلة مدمجة] → [شريط تبويبات] مع safe-area.
 * - `--mobile-commerce-floating-actions-bottom` يحاذي أزرار الجانب (سوشيال/مساعد) مع صف الكبسولة.
 * - يُخفى على /cart و/checkout والمساعد؛ السلة تفضل ظاهرة عند السكرول.
 *
 * شوف كمان: `@/components/layout/bottom-nav.tsx`، `@/features/cart/components/MobileCartBottomSheet.tsx`
 */
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useLayoutEffect, useRef } from "react";
import { useMobileAssistantOpenStore } from "@/components/layout/mobile-assistant-open-store";
import { useMobileChromeCollapsedStore } from "@/components/layout/mobile-chrome-collapsed-store";
import { useCart } from "@/hooks/useCart";
import { ROUTES } from "@/lib/constants";
import { BottomNavInner } from "@/components/layout/bottom-nav";
import {
  mobileCommerceBottomNavCapsuleClassName,
  mobileCommerceBottomNavShellClassName,
  mobileCommerceChromeColumnClass,
} from "@/components/layout/mobile-commerce-surface";
import { cn } from "@/lib/utils";

/** السلة الكاملة تتعمل lazy — مفيش حاجة تقيلة في الـ bundle الأول. */
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
  const assistantOpen = useMobileAssistantOpenStore((s) => s.open);
  const rootRef = useRef<HTMLDivElement>(null);
  const cartPeekRef = useRef<HTMLDivElement>(null);
  const bottomNavRef = useRef<HTMLDivElement>(null);
  const reservedHeightRef = useRef(0);
  const reservedHeightKeyRef = useRef("");

  const isAssistantPage = pathname === ROUTES.ASSISTANT;
  const hideFloatingCart =
    pathname === ROUTES.CART ||
    pathname === ROUTES.CHECKOUT ||
    isAssistantPage;

  const showCartSummary = totalItems > 0 && !hideFloatingCart;
  const hideBottomNav = pathname === ROUTES.CHECKOUT || isAssistantPage;

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
          : 52;
      let floatingActionsBottom = bottomNavBase;
      if (showCartSummary && cartPeekRef.current) {
        const cartBottom = cartPeekRef.current.getBoundingClientRect().bottom;
        floatingActionsBottom = Math.max(
          bottomNavBase,
          Math.ceil(window.innerHeight - cartBottom),
        );
      }

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
    if (cartPeekRef.current) {
      ro.observe(cartPeekRef.current);
    }
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
  }, [pathname, showCartSummary]);

  return (
    <div
      ref={rootRef}
      data-mobile-commerce-chrome
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col gap-3 lg:hidden"
    >
      {isAssistantPage ? null : (
        <>
          {showCartSummary ? (
            <div
              ref={cartPeekRef}
              className={cn(
                "pointer-events-auto min-h-[3.25rem]",
                mobileCommerceChromeColumnClass,
              )}
            >
              <MobileCartBottomSheet showCartSummary={showCartSummary} />
            </div>
          ) : null}
          {hideBottomNav ? null : (
            <div
              ref={bottomNavRef}
              aria-hidden={assistantOpen}
              inert={assistantOpen ? true : undefined}
              className={cn(
                mobileCommerceBottomNavShellClassName(headerHidden),
                "pointer-events-auto w-full   pt-0 transition-[opacity,filter] duration-200 ease-out motion-reduce:transition-none",
                assistantOpen
                  ? "pointer-events-none opacity-0 blur-[1px]"
                  : "opacity-100 blur-0",
              )}
            >
              <div
                className={cn(
                  mobileCommerceBottomNavCapsuleClassName(headerHidden),
                  "min-h-[50px]",
                )}
              >
                <BottomNavInner />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
