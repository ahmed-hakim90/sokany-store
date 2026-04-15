"use client";

import { cn } from "@/lib/utils";

export type PaymentOptionCardProps = {
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
};

export function PaymentOptionCard({
  title,
  description,
  selected,
  onSelect,
}: PaymentOptionCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "w-full rounded-2xl border-2 p-3.5 text-start transition-[border-color,box-shadow,background-color,transform] active:scale-[0.99]",
        selected
          ? "border-brand-500 bg-brand-500/12 shadow-[inset_0_0_0_1px_rgba(218,255,0,0.5),0_10px_26px_-16px_rgba(218,255,0,0.55)]"
          : "border-transparent bg-surface-muted/55 ring-1 ring-border/60 hover:bg-white hover:ring-brand-500/25",
      )}
    >
      <span className="block text-sm font-semibold text-brand-950">{title}</span>
      <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">{description}</span>
    </button>
  );
}
