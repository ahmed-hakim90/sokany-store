"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";
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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = as === "section" ? sectionRef.current : divRef.current;
    if (!el) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
            return;
          }
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -48px 0px",
        threshold: [0, 0.12, 0.25, 0.5, 1],
      },
    );
    obs.observe(el);
    return () => obs.disconnect();
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
