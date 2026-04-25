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
  /** `segmented` matches PDP pill row (− | qty | +) in a rounded rectangle. */
  layout?: "pill" | "segmented";
  /** Use ≥44px tap targets for +/- (cart, mobile drawers). */
  touchComfortable?: boolean;
  /** Slimmer capsule for premium cart cards. */
  compact?: boolean;
};

export function QtyControl({
  value,
  min = 1,
  max = 999,
  onChange,
  disabled,
  className,
  layout = "pill",
  touchComfortable = false,
  compact = false,
}: QtyControlProps) {
  const decDisabled = disabled || value <= min;
  const incDisabled = disabled || value >= max;
  const segmented = layout === "segmented";
  const iconSize = compact ? "sm" : touchComfortable ? "lg" : "sm";

  return (
    <div
      className={cn(
        "inline-flex overflow-hidden border border-border bg-white",
        segmented
          ? "items-stretch rounded-xl bg-surface-muted/90 p-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
          : compact
            ? "h-9 items-center gap-0 rounded-full border-slate-200/90 bg-slate-50/95 px-0.5 shadow-sm shadow-slate-900/5"
            : "items-center gap-1 rounded-full p-0.5",
        className,
      )}
    >
      <IconButton
        type="button"
        variant="subtle"
        size={iconSize}
        aria-label="نقص الكمية"
        disabled={decDisabled}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={cn(
          "border-0",
          segmented
            ? touchComfortable
              ? "rounded-none px-2 py-2 hover:bg-white/70"
              : "rounded-none px-3 py-2.5 hover:bg-white/70"
            : compact
              ? "h-8 w-8 shrink-0 rounded-full text-slate-700 hover:bg-white/90"
              : "rounded-full",
        )}
      >
        <MinusIcon compact={compact} />
      </IconButton>
      <span
        className={cn(
          "flex min-w-10 items-center justify-center text-sm font-semibold tabular-nums text-foreground",
          segmented ? "border-x border-border/80 bg-white px-2" : "min-w-8 text-center",
          compact && "min-w-8 text-xs font-bold text-slate-900",
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <IconButton
        type="button"
        variant="subtle"
        size={iconSize}
        aria-label="زيادة الكمية"
        disabled={incDisabled}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={cn(
          "border-0",
          segmented
            ? touchComfortable
              ? "rounded-none px-2 py-2 hover:bg-white/70"
              : "rounded-none px-3 py-2.5 hover:bg-white/70"
            : compact
              ? "h-8 w-8 shrink-0 rounded-full text-slate-700 hover:bg-white/90"
              : "rounded-full",
        )}
      >
        <PlusIcon compact={compact} />
      </IconButton>
    </div>
  );
}

function MinusIcon({ compact }: { compact?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("h-4 w-4", compact && "h-3.5 w-3.5")}
      aria-hidden
    >
      <path
        d="M6 12h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon({ compact }: { compact?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("h-4 w-4", compact && "h-3.5 w-3.5")}
      aria-hidden
    >
      <path
        d="M12 6v12M6 12h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
