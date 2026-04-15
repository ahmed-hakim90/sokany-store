"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type IconButtonVariant = "ghost" | "subtle" | "accent";
export type IconButtonSize = "sm" | "md";

const base =
  "inline-flex shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:pointer-events-none disabled:opacity-50";

const variantClasses: Record<IconButtonVariant, string> = {
  ghost: "text-foreground hover:bg-surface-muted/80",
  subtle:
    "border border-border bg-white text-foreground hover:bg-surface-muted",
  accent: "bg-brand-500 text-black hover:bg-brand-400",
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "h-8 w-8 [&_svg]:h-4 [&_svg]:w-4",
  md: "h-10 w-10 [&_svg]:h-5 [&_svg]:w-5",
};

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  "aria-label": string;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      className,
      variant = "ghost",
      size = "md",
      type = "button",
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(base, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);
