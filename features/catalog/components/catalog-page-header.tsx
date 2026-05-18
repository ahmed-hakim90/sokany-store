"use client";

import { ArrowUpDown } from "lucide-react";
import { CatalogSortSelect } from "@/features/catalog/components/catalog-sort-select";
import { useCatalogFilterDrawerOpenStore } from "@/features/catalog/store/useCatalogFilterDrawerOpenStore";
import { surfacePageHeroClass } from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";

export type CatalogPageHeaderProps = {
  title: string;
  subtitle?: string | null;
  totalCount?: number | null;
  className?: string;
};

function formatCountSubtitle(totalCount?: number | null): string | null {
  if (typeof totalCount === "number" && totalCount > 0) {
    return `${totalCount} منتج متاح`;
  }
  return null;
}

/*
 * رأس صفحة الكتالوج (/products):
 * — صف واحد: عنوان (يمتد) + ترتيب؛ الجوال يفتح درج التصفية لخيارات الترتيب.
 * — الديسكتوب: نفس الصف مع قائمة ترتيب مباشرة (مزامنة مع معاملات الرابط).
 */
export function CatalogPageHeader({
  title,
  subtitle,
  totalCount,
  className,
}: CatalogPageHeaderProps) {
  const openDrawer = useCatalogFilterDrawerOpenStore((s) => s.openDrawer);
  const countLine = subtitle ?? formatCountSubtitle(totalCount);

  return (
    <header className={cn("min-w-0", className)}>
      <div
        className={cn(
          surfacePageHeroClass,
          "!px-4 !py-4 sm:!px-5 sm:!py-5 lg:!px-6 lg:!py-5",
        )}
      >
        <div className="flex min-w-0 items-start justify-between gap-3">
          <h1 className="min-w-0 flex-1 font-display text-xl font-bold tracking-tight text-brand-950 sm:text-2xl lg:text-3xl">
            {title}
          </h1>
          <div className="shrink-0 pt-0.5">
            <button
              type="button"
              onClick={() => openDrawer()}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border/80 bg-white px-3 text-xs font-semibold text-brand-950 transition-colors hover:bg-surface-muted/60 lg:hidden"
              aria-label="ترتيب المنتجات"
            >
              <ArrowUpDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
              ترتيب
            </button>
            <div className="hidden lg:block">
              <CatalogSortSelect compact />
            </div>
          </div>
        </div>
        {countLine ? (
          <p className="mt-1.5 text-sm text-muted-foreground">{countLine}</p>
        ) : null}
      </div>
    </header>
  );
}
