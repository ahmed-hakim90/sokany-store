import { cn } from "@/lib/utils";

type ProductRatingDisplayProps = {
  rating: number;
  ratingCount: number;
  className?: string;
  /** Smaller on mobile-compact cards */
  size?: "xs" | "sm";
};

const STAR_IDS = [1, 2, 3, 4, 5] as const;

/**
 * Read-only average rating for product cards (list/grid). Stars LTR for 1→5.
 */
export function ProductRatingDisplay({
  rating,
  ratingCount,
  className,
  size = "sm",
}: ProductRatingDisplayProps) {
  if (!(ratingCount > 0) || !(rating > 0)) {
    return null;
  }

  const clamped = Math.min(5, Math.max(0, rating));
  const starClass = size === "xs" ? "h-3 w-3" : "h-3.5 w-3.5";
  const textClass = size === "xs" ? "text-[10px]" : "text-[11px] sm:text-xs";
  const label = `متوسط التقييم ${clamped.toFixed(1)} من 5، ${ratingCount} تقييم`;

  return (
    <div
      className={cn("flex flex-wrap items-center gap-1.5", textClass, className)}
      dir="ltr"
    >
      <div className="flex items-center gap-px" role="img" aria-label={label}>
        {STAR_IDS.map((star) => {
          const fill = Math.min(1, Math.max(0, clamped - (star - 1)));
          return <Star key={star} fill={fill} className={starClass} />;
        })}
      </div>
      <span className="font-semibold tabular-nums text-neutral-800" dir="ltr">
        {clamped.toFixed(1)}
      </span>
      <span className="text-muted-foreground" dir="rtl">
        ({ratingCount})
      </span>
    </div>
  );
}

function Star({ fill, className }: { fill: number; className?: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, fill)) * 100);
  return (
    <span className={cn("relative inline-block shrink-0", className)}>
      <svg viewBox="0 0 24 24" className="block h-full w-full text-zinc-200" aria-hidden>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${pct}%` }}
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          className={cn("block shrink-0 text-amber-400", className)}
          aria-hidden
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
  );
}
