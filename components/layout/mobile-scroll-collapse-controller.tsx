"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useMobileChromeCollapsedStore } from "@/components/layout/mobile-chrome-collapsed-store";

/** عتبة أكبر قليلاً لتقليل التفعيل العرضي عند اهتزاز السكرول. */
const SCROLL_DOWN_DELTA = 14;
const NEAR_TOP_PX = 48;

/**
 * موبايل: يخفي الهيدر وشريط ملخص السلة عند السكرول للأسفل.
 * لا يعيد إظهارهما عند سكرول بسيط للأعلى (يقلل الطفو المزعج) —
 * الإظهار عند الاقتراب من أعلى الصفحة أو عند تغيير المسار.
 */
export function MobileScrollCollapseController() {
  const pathname = usePathname();
  const resetChrome = useMobileChromeCollapsedStore((s) => s.resetChrome);
  const hideChromeFromScroll = useMobileChromeCollapsedStore(
    (s) => s.hideChromeFromScroll,
  );
  const lastYRef = useRef(0);

  useEffect(() => {
    resetChrome();
  }, [pathname, resetChrome]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    lastYRef.current =
      window.scrollY ?? document.documentElement.scrollTop ?? 0;

    const onScroll = () => {
      if (!mq.matches) return;
      const y = window.scrollY ?? document.documentElement.scrollTop ?? 0;
      const delta = y - lastYRef.current;
      lastYRef.current = y;

      if (y < NEAR_TOP_PX) {
        resetChrome();
        return;
      }
      if (delta > SCROLL_DOWN_DELTA) {
        hideChromeFromScroll();
      }
    };

    const onMqChange = () => {
      if (!mq.matches) {
        resetChrome();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    mq.addEventListener("change", onMqChange);
    return () => {
      window.removeEventListener("scroll", onScroll);
      mq.removeEventListener("change", onMqChange);
    };
  }, [resetChrome, hideChromeFromScroll]);

  return null;
}
