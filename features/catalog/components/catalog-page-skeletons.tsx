import { CategoryScrollerSkeleton } from "@/features/categories/components/CategoryScrollerSkeleton";
import { ProductSkeleton } from "@/features/products/components/ProductSkeleton";
import { surfacePageHeroClass, surfacePanelClass } from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";

/*
 * هياكل تحميل لصفحة المنتجات — رأس، سكة، بانر، شبكة.
 */
export function CatalogPageHeaderSkeleton() {
  return (
    <div
      className={cn(
        surfacePageHeroClass,
        "!px-3 !py-2.5 sm:!px-4 sm:!py-3 lg:!px-5 lg:!py-3.5",
        "animate-shimmer bg-gradient-to-r from-image-well via-surface-muted to-image-well bg-[length:200%_100%]",
      )}
      aria-hidden
    >
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="h-6 w-2/3 max-w-xs rounded bg-border/60 sm:h-7" />
        <div className="h-8 w-20 shrink-0 rounded-lg bg-border/50 sm:h-9 sm:w-24" />
      </div>
    </div>
  );
}

export function CatalogBannerSkeleton() {
  return (
    <div
      className="aspect-[16/5] w-full animate-shimmer rounded-2xl bg-gradient-to-r from-image-well via-surface-muted to-image-well bg-[length:200%_100%]"
      aria-hidden
    />
  );
}

export function CatalogSidebarSkeleton() {
  return (
    <div className={cn(surfacePanelClass, "hidden space-y-3 p-3 lg:block")} aria-hidden>
      <div className="h-3 w-16 animate-shimmer rounded bg-border/50" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-2">
          <div className="h-9 w-9 shrink-0 animate-shimmer rounded-lg bg-surface-muted" />
          <div className="h-9 flex-1 animate-shimmer rounded-lg bg-surface-muted/80" />
        </div>
      ))}
    </div>
  );
}

export function CatalogProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}

export function CatalogDiscoverySkeleton() {
  return <CategoryScrollerSkeleton count={8} variant="tiles" />;
}
