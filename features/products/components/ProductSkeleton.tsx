/**
 * Placeholder aligned with catalog `ProductCard` image wells and compact cart CTA.
 */
export function ProductSkeleton() {
  return (
    <div className="surface-product-card flex h-full min-w-0 flex-col gap-0 overflow-hidden rounded-2xl border-0 p-0 shadow-none ring-0">
      <div className="h-[152px] w-full animate-shimmer rounded-t-2xl bg-gradient-to-r from-image-well via-background to-image-well bg-[length:200%_100%] sm:h-[160px] md:h-[180px] lg:h-[190px]" />
      <div className="flex flex-1 flex-col gap-1 px-2 pb-1.5 pt-1.5 sm:gap-1.5 sm:px-2.5 sm:pb-2 sm:pt-2">
        <div className="min-h-[2.05rem] space-y-1.5">
          <div className="h-3.5 w-4/5 animate-shimmer rounded bg-surface-muted/90 ring-1 ring-foreground/[0.04]" />
          <div className="h-3.5 w-3/5 animate-shimmer rounded bg-surface-muted/90 ring-1 ring-foreground/[0.04]" />
        </div>
        <div className="flex min-h-[1.125rem] items-center gap-1 py-px">
          <div className="h-3.5 w-3.5 animate-shimmer rounded-full bg-surface-muted/80 ring-1 ring-foreground/[0.03]" />
          <div className="h-3 w-24 animate-shimmer rounded bg-surface-muted/70 ring-1 ring-foreground/[0.03]" />
        </div>
        <div className="h-4 w-20 animate-shimmer rounded bg-surface-muted/70 ring-1 ring-foreground/[0.03]" />
        <div className="mt-auto grid grid-cols-1 items-center gap-1.5 sm:gap-2">
          <div className="space-y-1">
            <div className="h-[18px] w-20 animate-shimmer rounded bg-surface-muted/90 ring-1 ring-foreground/[0.04]" />
            <div className="h-2.5 w-12 animate-shimmer rounded bg-surface-muted/80 ring-1 ring-foreground/[0.03]" />
          </div>
          <div className="h-8 w-full animate-shimmer rounded-lg bg-surface-muted/90 ring-1 ring-foreground/[0.04]" />
        </div>
      </div>
    </div>
  );
}
