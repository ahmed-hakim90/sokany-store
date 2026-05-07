"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";
import { subscribeScrollReveal } from "@/components/scroll-reveal-shared";
import { cn } from "@/lib/utils";

export type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** ‎`section`‎ عند الحاجة للدلالة الدلاليّة. */
  as?: "div" | "section";
} & Pick<
  ComponentPropsWithoutRef<"div">,
  "id" | "aria-labelledby" | "aria-label" | "role"
>;

/**
 * يُظهر القسم عند اقترابه من نافذة العرض — CSS transition + IntersectionObserver
 * (بدون framer-motion لتقليل حجم الحزمة على الصفحة الرئيسية).
 */
export function ScrollReveal({
  children,
  className,
  as = "div",
  ...a11y
}: ScrollRevealProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<ComponentRef<"section">>(null);
  const [visible, setVisible] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const el = as === "section" ? sectionRef.current : divRef.current;
    if (!el) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const revealIfReducedMotion = () => {
      if (mq.matches) setVisible(true);
    };

    mq.addEventListener("change", revealIfReducedMotion);
    if (mq.matches) return () => mq.removeEventListener("change", revealIfReducedMotion);

    const unobserve = subscribeScrollReveal(el, () => setVisible(true));
    return () => {
      mq.removeEventListener("change", revealIfReducedMotion);
      unobserve();
    };
  }, [as]);

  const merged = cn(
    "transition-[opacity,transform] duration-[450ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] motion-reduce:transition-none",
    visible
      ? "translate-y-0 opacity-100"
      : "translate-y-[18px] opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100",
    className,
  );

  if (as === "section") {
    return (
      <section ref={sectionRef} className={merged} {...a11y}>
        {children}
      </section>
    );
  }

  return (
    <div ref={divRef} className={merged} {...a11y}>
      {children}
    </div>
  );
}
