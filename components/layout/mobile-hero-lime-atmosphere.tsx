"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useMobileChromeCollapsedStore } from "@/components/layout/mobile-chrome-collapsed-store";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/*
 * موبايل: هالة ليم عالية التباين تضعف تدريجياً حتى ‎~نص الشاشة ‎(50dvh)‎ نحو ‎`--page`‎؛
 * عند ‎`headerHidden`‎ (سيرش + أدوات بلا صف شعار) تضيق الهالة لإحساس بأن شريط البحث بات «مرسوم» في نطاق أعلى أصغر.
 * ‎`z-0` — **خلف** ‎`main` ‎(‎`max-lg:z-1`‎) والمحتوى، تحت الهيدر ‎(z-50)‎؛ تُرى من الشفافيّات ومن
 * غلاف الصفحة الرئيسية (بدون ‎`bg`‎ على الموبايل) خلف بانر الهيرو/الهوامس.
 */

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
  const heightVh = headerHidden ? 15 : 50;
  const opacity = headerHidden ? 0.26 : 0.86;

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
