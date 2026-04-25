"use client";

import { Link } from "next-view-transitions";
import { cn } from "@/lib/utils";

const pageNavBtnClass =
  "inline-flex h-8 min-w-[5.5rem] items-center justify-center rounded-md border border-border bg-white px-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500";

export type CatalogPaginationProps = {
  currentPage: number;
  totalPages: number;
  getHref: (page: number) => string;
  "aria-label"?: string;
  className?: string;
};

/**
 * مُكوّن ترقيم صفحات للكتالوج (واجهة ‎RTL).
 */
export function CatalogPagination({
  currentPage,
  totalPages,
  getHref,
  "aria-label": ariaLabel = "تصفح الصفحات",
  className,
}: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <nav
      className={cn("flex items-center justify-center gap-2 pt-4", className)}
      aria-label={ariaLabel}
    >
      {canPrev ? (
        <Link
          className={pageNavBtnClass}
          href={getHref(currentPage - 1)}
          rel="prev"
        >
          → السابقة
        </Link>
      ) : (
        <span
          className={cn(pageNavBtnClass, "pointer-events-none opacity-50")}
          aria-hidden
        >
          → السابقة
        </span>
      )}
      <span
        className="min-w-[6rem] text-center text-sm tabular-nums text-muted-foreground"
        dir="ltr"
      >
        {currentPage} / {totalPages}
      </span>
      {canNext ? (
        <Link
          className={pageNavBtnClass}
          href={getHref(currentPage + 1)}
          rel="next"
        >
          التالية ←
        </Link>
      ) : (
        <span
          className={cn(pageNavBtnClass, "pointer-events-none opacity-50")}
          aria-hidden
        >
          التالية ←
        </span>
      )}
    </nav>
  );
}
