"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
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
 * نحافظ على نفس عنصر الـ motion في SSR وأول render للعميل لتجنب hydration mismatch.
 * Framer Motion يتعامل مع تقليل الحركة عبر إعداداته العامة إن وُجدت.
 */
export function ScrollReveal({ children, className, as = "div", ...a11y }: ScrollRevealProps) {
  const Motion = as === "section" ? motion.section : motion.div;

  return (
    <Motion className={cn("will-change-[opacity,transform]", className)} {...a11y} {...motionProps}>
      {children}
    </Motion>
  );
}
