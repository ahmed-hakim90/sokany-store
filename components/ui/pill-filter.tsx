"use client";

import { cn } from "@/lib/utils";

export type PillFilterProps = {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
};

export function PillFilter({
  children,
  active,
  disabled,
  className,
  type = "button",
  onClick,
}: PillFilterProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-brand-500 bg-brand-500 text-black"
          : "border-border bg-white text-foreground hover:border-brand-500/40 hover:bg-surface-muted/50",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}
