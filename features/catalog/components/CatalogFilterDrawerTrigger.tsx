"use client";

import { useCatalogFilterDrawerOpenStore } from "@/features/catalog/store/useCatalogFilterDrawerOpenStore";
import { cn } from "@/lib/utils";

function FilterSlidersIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        d="M4 6h16M8 12h8M10 18h4"
        strokeLinecap="round"
      />
      <circle cx="14" cy="6" r="2" fill="currentColor" stroke="none" />
      <circle cx="10" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="14" cy="18" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CatalogFilterDrawerTrigger({
  className,
  hasFilters = false,
}: {
  className?: string;
  hasFilters?: boolean;
}) {
  const openDrawer = useCatalogFilterDrawerOpenStore((s) => s.openDrawer);

  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/80 bg-white text-brand-950 shadow-sm transition-colors hover:bg-surface-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        className,
      )}
      aria-label="فتح تصفية المنتجات"
      onClick={() => openDrawer()}
    >
      <FilterSlidersIcon className="h-[18px] w-[18px]" />
      {hasFilters ? (
        <span className="absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
      ) : null}
    </button>
  );
}
