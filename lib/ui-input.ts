import { cn } from "@/lib/utils";

/** Shared field chrome for text inputs and selects */
export function inputSurfaceClass(opts?: { compact?: boolean; invalid?: boolean }) {
  return cn(
    " rounded-md border border-border bg-white text-foreground transition-[box-shadow,border-color]",
    "px-3 text-sm outline-none",
    opts?.compact ? "py-1.5" : "py-2",
    "placeholder:text-muted-foreground/80",
    "focus-visible:border-brand-900 focus-visible:ring-2 focus-visible:ring-brand-500/35",
    "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70",
    opts?.invalid &&
      "border-red-500 focus-visible:border-red-600 focus-visible:ring-red-500/30",
  );
}
