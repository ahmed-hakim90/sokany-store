/**
 * Placeholder aligned with catalog `ProductCard` — fixed image well, overlapping agent tag.
 */
export function ProductSkeleton() {
  return (
    <div className="surface-product-card flex h-full min-w-0 flex-col gap-0 overflow-hidden rounded-xl border border-black/[0.06] p-0 shadow-[0_8px_24px_-14px_rgba(15,23,42,0.22)]">
      <div className="relative z-[2] h-[clamp(180px,52vw,216px)] w-full shrink-0 overflow-visible">
        <div className="absolute inset-0 overflow-hidden bg-white animate-shimmer bg-gradient-to-r from-white via-surface-muted/70 to-white bg-[length:200%_100%] md:h-[210px] lg:h-[220px] xl:h-[232px]" />
        <div className="absolute inset-x-0 bottom-0 z-[1] flex translate-y-1/2 justify-center px-2">
          <div className="h-6 w-28 animate-shimmer rounded-full bg-surface-muted/90 ring-1 ring-foreground/[0.04]" />
        </div>
      </div>
      <div className="z-[1] flex min-h-0 flex-1 flex-col gap-1 bg-white px-2.5 pb-2 pt-3.5 sm:px-3 sm:pb-2.5 sm:pt-4">
        <div className="flex min-h-[2.35rem] flex-col items-center gap-1">
          <div className="h-3.5 w-11/12 animate-shimmer rounded bg-surface-muted/90 ring-1 ring-foreground/[0.04]" />
          <div className="h-3.5 w-8/12 animate-shimmer rounded bg-surface-muted/80 ring-1 ring-foreground/[0.03]" />
        </div>
        <div className="mt-auto grid grid-cols-1 items-center gap-1 sm:gap-1.5">
          <div className="flex flex-col items-center gap-1">
            <div className="h-[18px] w-20 animate-shimmer rounded bg-surface-muted/90 ring-1 ring-foreground/[0.04]" />
            <div className="h-2.5 w-12 animate-shimmer rounded bg-surface-muted/80 ring-1 ring-foreground/[0.03]" />
          </div>
          <div className="h-10 w-full animate-shimmer rounded-lg bg-surface-muted/90 ring-1 ring-foreground/[0.04]" />
        </div>
      </div>
    </div>
  );
}
