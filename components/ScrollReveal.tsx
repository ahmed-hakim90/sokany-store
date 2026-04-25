"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

const motionProps: Pick<
  HTMLMotionProps<"div">,
  "initial" | "whileInView" | "viewport" | "transition"
> = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.12, margin: "0px 0px -48px 0px" },
  transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
};

export type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** ‎`section`‎ عند الحاجة للدلالة الدلاليّة. */
  as?: "div" | "section";
} & Pick<
  HTMLMotionProps<"div">,
  "id" | "aria-labelledby" | "aria-label" | "role"
>;

/**
 * يلتقط القسم عند اقترابه من نافذة العرض (سكرول) ويُظهره بانتقال خفيف.
 * عند ‎`prefers-reduced-motion`‎ يُعرض المحتوى ثابتاً.
 */
export function ScrollReveal({ children, className, as = "div", ...a11y }: ScrollRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    const Static = as;
    return (
      <Static className={className} {...a11y}>
        {children}
      </Static>
    );
  }

  const Motion = as === "section" ? motion.section : motion.div;

  return (
    <Motion className={cn("will-change-[opacity,transform]", className)} {...a11y} {...motionProps}>
      {children}
    </Motion>
  );
}
