import { cn } from "@/lib/utils";

export type CardVariant = "product" | "feature" | "summary" | "surface";

const variantClasses: Record<CardVariant, string> = {
  product:
    "rounded-xl border border-black/[0.06] bg-white shadow-[0_2px_16px_-4px_rgba(15,23,42,0.07)] transition-shadow hover:shadow-[0_8px_24px_-6px_rgba(15,23,42,0.1)]",
  feature:
    "rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.07)] md:p-8",
  summary:
    "rounded-xl border border-black/[0.06] bg-white p-6 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.07)]",
  surface:
    "rounded-xl border border-border/80 bg-surface-muted/25 shadow-[0_1px_10px_-3px_rgba(15,23,42,0.05)]",
};

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

export function Card({
  className,
  variant = "surface",
  children,
  ...props
}: CardProps) {
  return (
    <div className={cn(variantClasses[variant], className)} {...props}>
      {children}
    </div>
  );
}
