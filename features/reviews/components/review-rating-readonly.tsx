import { cn } from "@/lib/utils";

const STAR_IDS = [1, 2, 3, 4, 5] as const;

type ReviewRatingReadonlyProps = {
  rating: number;
  className?: string;
  size?: "sm" | "md";
};

/**
 * نجوم وقراءة فقط (تقييم فردي). اتجاه النجوم LTR حتى 1→5 مثل باقي المتجر.
 */
export function ReviewRatingReadonly({ rating, className, size = "sm" }: ReviewRatingReadonlyProps) {
  const clamped = Math.min(5, Math.max(0, rating));
  const starClass = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  const textClass = size === "md" ? "text-sm" : "text-xs";
  const label = `تقييم ${clamped.toFixed(1)} من 5`;

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
      <span className="font-semibold tabular-nums text-zinc-800" dir="ltr">
        {clamped.toFixed(1)}
      </span>
      <span className="text-zinc-500" dir="rtl">
        من 5
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
