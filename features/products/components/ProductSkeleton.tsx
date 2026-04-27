export function ProductSkeleton() {
  return (
    <div className="flex h-full flex-col gap-2 overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-2.5 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.26)]">
      <div className="h-[132px] w-full animate-shimmer rounded-xl bg-gradient-to-r from-image-well via-surface-muted to-image-well bg-[length:200%_100%] sm:h-[150px] lg:h-[160px]" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-6 w-4/5 animate-shimmer rounded border-b border-slate-200/80 bg-border pb-2" />
        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5">
          <div className="h-5 w-20 animate-shimmer rounded bg-border" />
          <div className="h-8 w-16 animate-shimmer rounded-full bg-border sm:h-9" />
        </div>
      </div>
    </div>
  );
}
