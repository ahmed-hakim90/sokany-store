import { cn } from "@/lib/utils";

/** هيكل تحميل يطابق شريط التصنيفات الأفقي (دوائر + تسمية) تحت `lg`. */
export function CategoryScrollerSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="flex min-w-0 gap-2 overflow-x-hidden px-0 pb-1 pt-2.5 sm:gap-2.5 sm:pb-1.5 sm:pt-3" aria-hidden>
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
