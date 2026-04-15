"use client";

import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

export type QtyControlProps = {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  className?: string;
};

export function QtyControl({
  value,
  min = 1,
  max = 999,
  onChange,
  disabled,
  className,
}: QtyControlProps) {
  const decDisabled = disabled || value <= min;
  const incDisabled = disabled || value >= max;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-white p-0.5",
        className,
      )}
    >
      <IconButton
        type="button"
        variant="subtle"
        size="sm"
        aria-label="نقص الكمية"
        disabled={decDisabled}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="rounded-full border-0"
      >
        <MinusIcon />
      </IconButton>
      <span
        className="min-w-8 text-center text-sm font-semibold tabular-nums text-foreground"
        aria-live="polite"
      >
        {value}
      </span>
      <IconButton
        type="button"
        variant="subtle"
        size="sm"
        aria-label="زيادة الكمية"
        disabled={incDisabled}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="rounded-full border-0"
      >
        <PlusIcon />
      </IconButton>
    </div>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M6 12h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M12 6v12M6 12h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
