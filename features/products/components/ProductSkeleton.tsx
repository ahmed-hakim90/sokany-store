/**
 * Placeholder aligned with catalog `ProductCard` image wells and compact cart CTA.
 */
export function ProductSkeleton() {
  return (
    <div className="surface-product-card flex h-full min-w-0 flex-col gap-2 overflow-hidden rounded-2xl border-0 p-0 shadow-none ring-0">
      <div className="h-[136px] w-full animate-shimmer rounded-xl bg-gradient-to-r from-surface-muted via-background to-surface-muted bg-[length:200%_100%] sm:h-[146px] lg:h-[154px]" />
      <div className="flex flex-1 flex-col gap-1.5 px-2 pb-2 pt-1 sm:gap-2 sm:px-2.5 sm:pb-2.5 sm:pt-1.5">
        <div className="min-h-[2.25rem] space-y-1.5">
          <div className="h-3.5 w-4/5 animate-shimmer rounded bg-surface-muted/90 ring-1 ring-foreground/[0.04]" />
          <div className="h-3.5 w-3/5 animate-shimmer rounded bg-surface-muted/90 ring-1 ring-foreground/[0.04]" />
        </div>
        <div className="flex min-h-4 items-center gap-1.5">
          <div className="h-3 w-16 animate-shimmer rounded bg-surface-muted/80 ring-1 ring-foreground/[0.03]" />
          <div className="h-3 w-8 animate-shimmer rounded bg-surface-muted/70 ring-1 ring-foreground/[0.03]" />
        </div>
        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5 sm:gap-2">
          <div className="space-y-1">
            <div className="h-[18px] w-20 animate-shimmer rounded bg-surface-muted/90 ring-1 ring-foreground/[0.04]" />
            <div className="h-2.5 w-12 animate-shimmer rounded bg-surface-muted/80 ring-1 ring-foreground/[0.03]" />
          </div>
          <div className="h-8 w-16 animate-shimmer rounded-lg bg-surface-muted/90 ring-1 ring-foreground/[0.04] sm:w-20" />
        </div>
      </div>
    </div>
  );
}
