export function CategorySkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-black/[0.06] bg-white shadow-[0_2px_16px_-4px_rgba(15,23,42,0.07)]">
      <div className="aspect-[4/3] w-full animate-shimmer bg-gradient-to-r from-image-well via-surface-muted to-image-well bg-[length:200%_100%]" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="h-4 w-2/3 animate-shimmer rounded bg-border" />
        <div className="h-3 w-full animate-shimmer rounded bg-border" />
      </div>
    </div>
  );
}
