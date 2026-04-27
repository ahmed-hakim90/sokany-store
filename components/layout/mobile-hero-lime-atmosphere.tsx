"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useMobileChromeCollapsedStore } from "@/components/layout/mobile-chrome-collapsed-store";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/*
 * موبايل: هالة ليم عالية التباين تضعف تدريجياً حتى ‎~نص الشاشة ‎(50dvh)‎ نحو ‎`--page`‎؛
 * ارتفاع الطبقة/الشفافية تقل تدريجياً مع ‎`scrollY`‎ (مدى ~‎`SCROLL_REACH_PX`‎). عند ‎`headerHidden`‎ (سيرش + أدوات بلا صف شعار) تضيق الهالة
 * لإحساس بأن شريط البحث بات «مرسوم» في نطاق أعلى أصغر.
 * ‎`z-0` — **خلف** ‎`main` ‎(‎`max-lg:z-1`‎) والمحتوى، تحت الهيدر ‎(z-50)‎؛ تُرى من الشفافيّات ومن
 * ‎`HomePageContent`‎ (بدون ‎`bg`‎) خلف بانر الهيرو/الهوامس.
 */

/** أطول = الهالة تضعف مع التمرير ببطء أكبر وتبقى أعلى على الشاشة. */
const SCROLL_REACH_PX = 560;

/** بعد الترطيب فقط (يتجنّب اختلاف SSR/هيدراتيشن). */
function useLgOrBelow() {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return () => {};
      }
      const mq = window.matchMedia("(max-width: 1023px)");
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(max-width: 1023px)").matches,
    () => false,
  );
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return () => {};
      }
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

export function MobileHeroLimeAtmosphere() {
  const pathname = usePathname();
  const isLgOrBelow = useLgOrBelow();
  const reducedMotion = usePrefersReducedMotion();
  const headerHidden = useMobileChromeCollapsedStore((s) => s.headerHidden);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!isLgOrBelow) return;
    const onScroll = () => {
      setScrollY(window.scrollY ?? document.documentElement.scrollTop ?? 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLgOrBelow]);

  const { heightVh, opacity } = useMemo(() => {
    const t = Math.min(1, scrollY / SCROLL_REACH_PX);
    if (headerHidden) {
      const h = 8 + 14 * (1 - t * 0.88);
      const o = 0.24 + 0.18 * (1 - t);
      return { heightVh: Math.max(7, Math.min(50, h)), opacity: Math.max(0.12, o) };
    }
    const h = 24 + 32 * (1 - t * 0.8);
    const o = 0.72 + 0.24 * (1 - t);
    return { heightVh: Math.max(17, Math.min(50, h)), opacity: Math.max(0.22, Math.min(1, o)) };
  }, [headerHidden, scrollY]);

  if (!isLgOrBelow || pathname === ROUTES.CHECKOUT) {
    return null;
  }

  return (
    <div
      aria-hidden
      data-lime-atmosphere
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-0",
        "max-h-[50dvh] min-h-0 w-full",
      )}
      style={{
        height: `${heightVh}dvh`,
        opacity,
        background: `linear-gradient(
          180deg,
          color-mix(in srgb, var(--color-brand-500) 100%, var(--color-page)) 0%,
          color-mix(in srgb, var(--color-brand-500) 44%, var(--color-page) 56%) 24%,
          color-mix(in srgb, var(--color-brand-500) 12%, var(--color-page) 88%) 50%,
          var(--color-page) 100%
        )`,
        transition: reducedMotion
          ? "none"
          : "height 0.32s cubic-bezier(0.33, 1, 0.68, 1), opacity 0.32s cubic-bezier(0.33, 1, 0.68, 1)",
      }}
    />
  );
}
