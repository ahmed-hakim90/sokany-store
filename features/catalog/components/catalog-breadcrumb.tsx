"use client";

import { Link } from "next-view-transitions";
import { ChevronLeft } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type CatalogBreadcrumbProps = {
  categoryName?: string | null;
  className?: string;
};

/*
 * مسار تنقّل الكتالوج: الرئيسية / المنتجات / (تصنيف).
 */
export function CatalogBreadcrumb({ categoryName, className }: CatalogBreadcrumbProps) {
  return (
    <nav
      aria-label="مسار التنقّل"
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-1 text-xs text-muted-foreground sm:text-sm",
        className,
      )}
    >
      <Link
        href={ROUTES.HOME}
        className="font-medium text-brand-800 transition-colors hover:text-brand-950"
      >
        الرئيسية
      </Link>
      <ChevronLeft className="h-3.5 w-3.5 shrink-0 rotate-180 opacity-50" aria-hidden />
      <Link
        href={ROUTES.PRODUCTS}
        className={cn(
          "font-medium transition-colors hover:text-brand-950",
          categoryName ? "text-brand-800" : "text-brand-950",
        )}
      >
        المنتجات
      </Link>
      {categoryName ? (
        <>
          <ChevronLeft className="h-3.5 w-3.5 shrink-0 rotate-180 opacity-50" aria-hidden />
          <span className="min-w-0 truncate font-semibold text-brand-950" aria-current="page">
            {categoryName}
          </span>
        </>
      ) : null}
    </nav>
  );
}
