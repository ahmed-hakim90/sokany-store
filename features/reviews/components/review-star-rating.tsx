"use client";

import { cn } from "@/lib/utils";

const STAR_IDS = [1, 2, 3, 4, 5] as const;

type ReviewStarRatingProps = {
  value: number;
  onChange: (rating: number) => void;
  /** Visually order stars LTR so 1→5 matches common rating UX on RTL pages */
  dir?: "ltr" | "rtl";
  className?: string;
};

export function ReviewStarRating({
  value,
  onChange,
  dir = "ltr",
  className,
}: ReviewStarRatingProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-1", className)}
      dir={dir}
      role="group"
      aria-label="التقييم من 1 إلى 5"
    >
      {STAR_IDS.map((star) => {
        const filled = value >= star;
        return (
          <button
            key={star}
            type="button"
            aria-label={`تقييم ${star} من 5`}
            aria-current={value === star ? true : undefined}
            className={cn(
              "rounded-md p-0.5 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40",
              "hover:scale-105 active:scale-95",
            )}
            onClick={() => onChange(star)}
          >
            <StarIcon filled={filled} />
          </button>
        );
      })}
    </div>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-8 w-8 sm:h-9 sm:w-9"
      aria-hidden
    >
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        className={cn(
          "transition-colors",
          filled
            ? "fill-amber-400 stroke-amber-500"
            : "fill-white stroke-zinc-400",
        )}
        strokeWidth={1.35}
        strokeLinejoin="round"
      />
    </svg>
  );
}
