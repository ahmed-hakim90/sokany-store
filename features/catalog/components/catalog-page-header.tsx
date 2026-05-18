"use client";

import { ArrowUpDown } from "lucide-react";
import { CatalogSortSelect } from "@/features/catalog/components/catalog-sort-select";
import { useCatalogFilterDrawerOpenStore } from "@/features/catalog/store/useCatalogFilterDrawerOpenStore";
import { surfacePageHeroClass } from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";

export type CatalogPageHeaderProps = {
  title: string;
  className?: string;
};

/*
 * رأس صفحة الكتالوج (/products):
 * — صف واحد مضغوط: عنوان + ترتيب؛ الجوال يفتح درج التصفية لخيارات الترتيب.
 * — الديسكتوب: نفس الصف مع قائمة ترتيب مباشرة (مزامنة مع معاملات الرابط).
 */
export function CatalogPageHeader({ title, className }: CatalogPageHeaderProps) {
  const openDrawer = useCatalogFilterDrawerOpenStore((s) => s.openDrawer);

  return (
    <header className={cn("min-w-0", className)}>
      <div
        className={cn(
          surfacePageHeroClass,
          "!px-3 !py-2.5 sm:!px-4 sm:!py-3 lg:!px-5 lg:!py-3.5",
        )}
      >
        <div className="flex min-w-0 items-center justify-between gap-3">
          <h1 className="min-w-0 flex-1 font-display text-lg font-bold tracking-tight text-brand-950 sm:text-xl lg:text-2xl">
            {title}
          </h1>
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => openDrawer()}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-border/80 bg-white px-2.5 text-xs font-semibold text-brand-950 transition-colors hover:bg-surface-muted/60 lg:hidden"
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
      </div>
    </header>
  );
}
