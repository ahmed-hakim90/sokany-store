import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "accent"
  | "dark"
  | "subtle"
  | "success"
  | "sale";

const variantClasses: Record<BadgeVariant, string> = {
  accent: "bg-brand-500 text-black",
  dark: "bg-brand-950 text-white",
  subtle: "bg-surface-muted text-brand-900",
  success: "bg-emerald-100 text-emerald-900",
  sale: "bg-red-100 text-red-800",
};

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  children,
  className,
  variant = "subtle",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
