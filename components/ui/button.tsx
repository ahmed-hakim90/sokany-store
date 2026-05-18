"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "dark"
  | "commerce"
  | "commerceDark";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-500 text-black hover:bg-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900 disabled:bg-brand-200 disabled:text-black/50",
  secondary:
    "border border-border bg-white text-foreground hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-50",
  ghost:
    "bg-transparent text-foreground hover:bg-surface-muted/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-50",
  dark:
    "bg-brand-950 text-white hover:bg-brand-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-50",
  commerce:
    "rounded-full border border-brand-800/12 bg-brand-300 font-black text-brand-950 shadow-md hover:bg-brand-400/85 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:bg-brand-200/80 disabled:text-brand-950/50",
  commerceDark:
    "rounded-full bg-brand-950 font-bold text-white shadow-[0_12px_28px_-14px_rgba(15,23,42,0.55)] hover:bg-brand-900 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-11 w-11 shrink-0 p-0 text-base",
};

/** For server `Link` CTAs that match `variant="commerce"` + `size="lg"`. */
export const commerceLinkClassName = cn(
  base,
  variantClasses.commerce,
  sizeClasses.lg,
  "inline-flex min-w-[11rem] px-8",
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      className,
      variant = "primary",
      size = "md",
      type = "button",
      loading = false,
      disabled,
      ...props
    },
    ref,
  ) {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        type={type}
        className={cn(base, variantClasses[variant], sizeClasses[size], className)}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <span
            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
        ) : null}
        {children}
      </button>
    );
  },
);
