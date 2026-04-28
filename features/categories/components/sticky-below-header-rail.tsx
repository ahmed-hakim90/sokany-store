"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** يُطابق غلاف الهيدر اللاصق في `SiteShell` (إعلان + شريط تنقل + شريط اختصارات التصنيفات). */
export const SITE_STICKY_HEADER_STACK_ID = "site-sticky-header-stack";

type StickyBelowHeaderRailProps = {
  children: ReactNode;
  className?: string;
};

/**
 * يلتصق الشريط الأفقي للتصنيفات أسفل كتلة الهيدر مع احترام الارتفاع الديناميكي (إعلان، طي، إلخ).
 */
export function StickyBelowHeaderRail({ children, className }: StickyBelowHeaderRailProps) {
  const [topPx, setTopPx] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = document.getElementById(SITE_STICKY_HEADER_STACK_ID);
    if (!el) return;

    const sync = () => {
      requestAnimationFrame(() => {
        setTopPx(Math.round(el.getBoundingClientRect().height));
      });
    };

    const ro = new ResizeObserver(sync);
    ro.observe(el);
    sync();
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);

  return (
    <div
      className={cn(
        "sticky z-40 bg-transparent",
        className,
      )}
      style={
        topPx != null
          ? { top: topPx }
          : { top: "calc(env(safe-area-inset-top, 0px) + 7rem)" }
      }
    >
      {children}
    </div>
  );
}
