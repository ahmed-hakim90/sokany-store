import { cn } from "@/lib/utils";

/** هيكل تحميل يطابق شريط التصنيفات الأفقي (chips) تحت `lg`. */
export function CategoryScrollerSkeleton({ count = 8 }: { count?: number }) {
  const widths = ["w-24", "w-28", "w-32", "w-28", "w-32", "w-28", "w-24", "w-36"] as const;
  return (
    <div
      className="flex min-w-0 gap-2 overflow-x-hidden pb-2"
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-10 shrink-0 animate-shimmer rounded-full bg-gradient-to-r from-image-well via-surface-muted to-image-well bg-[length:200%_100%]",
            widths[i % widths.length],
          )}
        />
      ))}
    </div>
  );
}
