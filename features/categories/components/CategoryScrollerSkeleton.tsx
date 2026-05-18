import { cn } from "@/lib/utils";

type CategoryScrollerSkeletonProps = {
  count?: number;
  /** `circles`: دوائر الهيدر/المنتجات؛ `tiles`: بلاطات صفحة التصنيفات. */
  variant?: "circles" | "tiles";
};

/** هيكل تحميل للسكة الأفقية — دوائر (هيدر/كتالوج) أو بلاطات (تصنيفات). */
export function CategoryScrollerSkeleton({
  count = 8,
  variant = "circles",
}: CategoryScrollerSkeletonProps) {
  if (variant === "tiles") {
    return (
      <div
        className={cn(
          "flex min-w-0 gap-2 overflow-x-hidden pb-1 pt-2.5 sm:gap-2 sm:pt-3",
          "ps-[max(0.75rem,env(safe-area-inset-left))] pe-[max(0.75rem,env(safe-area-inset-right))]",
        )}
        aria-hidden
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex w-[5.75rem] shrink-0 flex-col overflow-hidden rounded-2xl border border-border/40"
          >
            <div className="aspect-square animate-shimmer bg-gradient-to-r from-image-well via-surface-muted to-image-well bg-[length:200%_100%]" />
            <div className="px-1.5 py-2">
              <div className="mx-auto h-3 w-12 animate-shimmer rounded bg-border/60" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-w-0 gap-2 overflow-x-hidden pb-1 pt-2.5 sm:gap-2.5 sm:pb-1.5 sm:pt-3",
        "ps-[max(0.75rem,env(safe-area-inset-left))] pe-[max(0.75rem,env(safe-area-inset-right))]",
      )}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex shrink-0 flex-col items-center gap-1.5">
          <div
            className={cn(
              "h-14 w-14 shrink-0 animate-shimmer rounded-full bg-gradient-to-r from-image-well via-surface-muted to-image-well bg-[length:200%_100%] sm:h-16 sm:w-16",
            )}
          />
          <div className="h-3 w-12 animate-shimmer rounded bg-border/60 sm:w-14" />
        </div>
      ))}
    </div>
  );
}
