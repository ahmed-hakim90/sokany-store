export function ProductSkeleton() {
  return (
    <div className="flex h-full flex-col gap-2 overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-2 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/[0.04] sm:p-2.5">
      <div className="h-[138px] w-full animate-shimmer rounded-xl bg-gradient-to-r from-image-well via-surface-muted to-image-well bg-[length:200%_100%] sm:h-[146px] lg:h-[154px]" />
      <div className="flex flex-1 flex-col gap-1.5 p-0.5 pt-0 sm:gap-2">
        <div className="min-h-[2.25rem] space-y-1.5">
          <div className="h-3.5 w-4/5 animate-shimmer rounded bg-border" />
          <div className="h-3.5 w-3/5 animate-shimmer rounded bg-border" />
        </div>
        <div className="flex min-h-4 items-center gap-1.5">
          <div className="h-3 w-16 animate-shimmer rounded bg-border/80" />
          <div className="h-3 w-8 animate-shimmer rounded bg-border/70" />
        </div>
        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5 sm:gap-2">
          <div className="space-y-1">
            <div className="h-[18px] w-20 animate-shimmer rounded bg-border" />
            <div className="h-2.5 w-12 animate-shimmer rounded bg-border/80" />
          </div>
          <div className="h-8 w-14 animate-shimmer rounded-full bg-border sm:w-16" />
        </div>
      </div>
    </div>
  );
}
