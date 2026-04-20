"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useMobileChromeCollapsedStore } from "@/components/layout/mobile-chrome-collapsed-store";

const SCROLL_DELTA = 10;
const NEAR_TOP_PX = 48;

/**
 * على الشاشات الصغيرة: يخفي الهيدر العلوي وشريط ملخص السلة عند السكرول للأسفل،
 * ويعيدهما عند السكرول للأعلى أو عند العودة لأعلى الصفحة.
 * يُصفّر الحالة عند تغيير المسار أو عند الانتقال لعرض سطح المكتب.
 */
export function MobileScrollCollapseController() {
  const pathname = usePathname();
  const expand = useMobileChromeCollapsedStore((s) => s.expand);
  const setCollapsed = useMobileChromeCollapsedStore((s) => s.setCollapsed);
  const lastYRef = useRef(0);

  useEffect(() => {
    expand();
  }, [pathname, expand]);

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
        setCollapsed(false);
        return;
      }
      if (delta > SCROLL_DELTA) {
        setCollapsed(true);
      } else if (delta < -SCROLL_DELTA) {
        setCollapsed(false);
      }
    };

    const onMqChange = () => {
      if (!mq.matches) {
        setCollapsed(false);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    mq.addEventListener("change", onMqChange);
    return () => {
      window.removeEventListener("scroll", onScroll);
      mq.removeEventListener("change", onMqChange);
    };
  }, [setCollapsed]);

  return null;
}
