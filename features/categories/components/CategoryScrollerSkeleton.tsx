export function CategoryScrollerSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="flex gap-3 overflow-x-hidden pb-2"
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex w-[100px] shrink-0 flex-col items-center gap-2 rounded-xl border border-border bg-card p-2 sm:w-[120px]"
        >
          <div className="h-12 w-12 shrink-0 animate-shimmer rounded-lg bg-gradient-to-r from-image-well via-surface-muted to-image-well bg-[length:200%_100%] sm:h-14 sm:w-14" />
          <div className="h-3  max-w-[72px] animate-shimmer rounded bg-border" />
          <div className="h-3 w-2/3 animate-shimmer rounded bg-border" />
        </div>
      ))}
    </div>
  );
}
