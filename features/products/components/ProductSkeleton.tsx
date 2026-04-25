export function ProductSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_4px_22px_-8px_rgba(15,23,42,0.12)]">
      <div className="aspect-square  animate-shimmer bg-gradient-to-r from-image-well via-surface-muted to-image-well bg-[length:200%_100%]" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="h-4 w-3/4 animate-shimmer rounded bg-border" />
        <div className="h-3 w-1/2 animate-shimmer rounded bg-border" />
        <div className="mt-auto h-9  animate-shimmer rounded bg-border" />
      </div>
    </div>
  );
}
