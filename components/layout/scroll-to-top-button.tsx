"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD_PX = 320;

/** زر التمرير لأعلى بدون غلاف `fixed` — يُوضَع داخل [`MobileFloatingActions`](./mobile-floating-actions.tsx). */
export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY ?? document.documentElement.scrollTop ?? 0;
      setVisible(y > SCROLL_THRESHOLD_PX);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "flex justify-end transition-[opacity,max-height] duration-200",
        visible
          ? "max-h-14 opacity-100"
          : "pointer-events-none max-h-0 overflow-hidden opacity-0",
      )}
    >
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="h-11 w-11 min-w-11 shrink-0 rounded-full p-0 shadow-md"
        tabIndex={visible ? 0 : -1}
        aria-label="العودة إلى أعلى الصفحة"
        onClick={() => {
          const reduced =
            typeof window.matchMedia === "function" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          window.scrollTo({
            top: 0,
            behavior: reduced ? "auto" : "smooth",
          });
        }}
      >
        <ChevronUp className="h-5 w-5 shrink-0" aria-hidden />
      </Button>
    </div>
  );
}
