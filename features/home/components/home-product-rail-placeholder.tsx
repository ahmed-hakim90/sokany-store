"use client";

import { cn } from "@/lib/utils";

const BAR =
  "animate-shimmer rounded-md bg-gradient-to-r from-image-well via-surface-muted to-image-well bg-[length:200%_100%]";

/**
 * خفيف — بدون ‎`ProductGrid`‎ ولا بطاقات: يحجز ارتفاعاً تقريبياً حتى يقترب القسم من الشاشة.
 */
export function HomeProductRailPlaceholder({
  className,
  minHeightClassName = "min-h-[220px] sm:min-h-[260px]",
  "aria-label": ariaLabel = "قسم منتجات",
}: {
  className?: string;
  minHeightClassName?: string;
  "aria-label"?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border/40 bg-surface-muted/30 px-3 py-4 sm:px-4",
        minHeightClassName,
        className,
      )}
      aria-busy
      aria-label={ariaLabel}
    >
      <div className={cn("h-4 w-36", BAR)} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={cn("aspect-[4/5] rounded-xl", BAR)} />
        ))}
      </div>
    </div>
  );
}
