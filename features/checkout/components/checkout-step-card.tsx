import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CheckoutStepCardProps = {
  step: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

/** بطاقة خطوة في إتمام الطلب — رقم + عنوان فقط (المنطق داخل الأب). */
export function CheckoutStepCard({
  step,
  title,
  subtitle,
  children,
  className,
}: CheckoutStepCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] sm:p-5",
        className,
      )}
    >
      <div className="mb-4 flex gap-3 border-b border-border/70 pb-4">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/20 font-display text-sm font-black text-brand-950"
          aria-hidden
        >
          {step}
        </span>
        <div className="min-w-0 text-start">
          <h2 className="font-display text-lg font-semibold tracking-tight text-brand-950">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}
