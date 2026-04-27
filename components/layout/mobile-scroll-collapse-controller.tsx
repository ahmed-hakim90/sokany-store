"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useMobileChromeCollapsedStore } from "@/components/layout/mobile-chrome-collapsed-store";

/** عتبة أكبر قليلاً لتقليل التفعيل العرضي عند اهتزاز السكرول. */
const SCROLL_DOWN_DELTA = 14;
/** أعلى من هذا الـ scrollY نسمح بإخفاء الكروم (hysteresis — أعلى من عتبة الإظهار). */
const HIDE_CHROME_MIN_Y = 96;
/** دون هذا نُظهر الكروم دائمًا؛ أعلى من `NEAR_TOP_PX` السابق لتوسيع نطاق الأمان. */
const SHOW_CHROME_BELOW_Y = 72;
/**
 * بعد إظهار الكروم من السكرول، نتجاهل الإخفاء قليلًا حتى تستقر إعادة قياس
 * الـ padding / `--mobile-commerce-chrome-height` ولا تُحدث قفزة `delta` كاذبة.
 */
const POST_RESET_COOLDOWN_MS = 220;
/** نؤجل الطي حتى تهدأ اللمسة، حتى لا يتغير ارتفاع الصفحة أثناء نفس حركة التمرير. */
const COLLAPSE_AFTER_SCROLL_IDLE_MS = 140;

/**
 * موبايل: سكرول للأسفل يطوي **صف الشعار** في الهيدر ويخفِي ملخص السلة.
 * **مربع البحث** و**شريط التصنيفات** يبقون ظاهرين.
 * الإظهار عند أعلى الصفحة أو تغيير المسار.
 */
export function MobileScrollCollapseController() {
  const pathname = usePathname();
  const resetChrome = useMobileChromeCollapsedStore((s) => s.resetChrome);
  const hideChromeFromScroll = useMobileChromeCollapsedStore(
    (s) => s.hideChromeFromScroll,
  );
  const lastYRef = useRef(0);
  const hideCooldownUntilRef = useRef(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    resetChrome();
  }, [pathname, resetChrome]);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(max-width: 1023px)");
    lastYRef.current =
      window.scrollY ?? document.documentElement.scrollTop ?? 0;

    const clearPendingHide = () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    const scheduleHideChrome = () => {
      clearPendingHide();
      hideTimerRef.current = setTimeout(() => {
        hideTimerRef.current = null;
        if (!mq.matches) return;
        const y = window.scrollY ?? document.documentElement.scrollTop ?? 0;
        if (y >= HIDE_CHROME_MIN_Y) {
          hideChromeFromScroll();
        }
      }, COLLAPSE_AFTER_SCROLL_IDLE_MS);
    };

    const onScroll = () => {
      if (!mq.matches) return;
      const now = performance.now();
      const y = window.scrollY ?? document.documentElement.scrollTop ?? 0;
      const delta = y - lastYRef.current;
      lastYRef.current = y;

      if (y < SHOW_CHROME_BELOW_Y) {
        clearPendingHide();
        resetChrome();
        hideCooldownUntilRef.current = now + POST_RESET_COOLDOWN_MS;
        return;
      }

      if (now < hideCooldownUntilRef.current) {
        return;
      }

      if (y >= HIDE_CHROME_MIN_Y && delta > SCROLL_DOWN_DELTA) {
        scheduleHideChrome();
      }
    };

    const onMqChange = () => {
      if (!mq.matches) {
        clearPendingHide();
        resetChrome();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    mq.addEventListener("change", onMqChange);
    return () => {
      clearPendingHide();
      window.removeEventListener("scroll", onScroll);
      mq.removeEventListener("change", onMqChange);
    };
  }, [resetChrome, hideChromeFromScroll]);

  return null;
}
