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
            className="flex w-[5.5rem] shrink-0 flex-col overflow-hidden rounded-xl border border-border/40"
          >
            <div className="h-14 w-full animate-shimmer bg-gradient-to-r from-image-well via-surface-muted to-image-well bg-[length:200%_100%]" />
            <div className="px-1.5 py-2">
              <div className="mx-auto h-3 w-12 animate-shimmer rounded bg-border/60" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* circles variant: بطاقة كاملة h-[5.5rem] بدون caption منفصل (text overlay) */
  return (
    <div
      className={cn(
        "flex min-w-0 gap-2 overflow-x-hidden pb-1 pt-2.5 sm:gap-2.5 sm:pb-1.5 sm:pt-3",
        "ps-[max(0.75rem,env(safe-area-inset-left))] pe-[max(0.75rem,env(safe-area-inset-right))]",
      )}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-[5.5rem] w-[4.5rem] shrink-0 animate-shimmer rounded-xl bg-gradient-to-r from-image-well via-surface-muted to-image-well bg-[length:200%_100%]"
        />
      ))}
    </div>
  );
}
