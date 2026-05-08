"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

const PULL_PX = 72;

/**
 * سحب للتحديث على الموبايل — ‎`invalidateQueries`‎ بدون إعادة تحميل الصفحة.
 */
export function StorefrontPullToRefresh({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const startY = useRef(0);
  const armed = useRef(false);

  useEffect(() => {
    const mobile =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches;
    if (!mobile) return;

    const onStart = (e: TouchEvent) => {
      if (window.scrollY > 8) {
        armed.current = false;
        return;
      }
      armed.current = true;
      startY.current = e.touches[0]?.clientY ?? 0;
    };

    const onEnd = (e: TouchEvent) => {
      if (!armed.current) return;
      armed.current = false;
      if (window.scrollY > 8) return;
      const y = e.changedTouches[0]?.clientY ?? 0;
      if (y - startY.current < PULL_PX) return;
      void (async () => {
        await Promise.all([
          qc.invalidateQueries({ queryKey: ["products"], exact: false }),
          qc.invalidateQueries({ queryKey: ["categories"], exact: false }),
          qc.invalidateQueries({ queryKey: ["product"], exact: false }),
        ]);
        toast.message("تم طلب تحديث البيانات");
      })();
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [qc]);

  return <>{children}</>;
}
