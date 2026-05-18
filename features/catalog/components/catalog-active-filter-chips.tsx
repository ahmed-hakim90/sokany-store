"use client";

import { useSearchParams } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import { startTransition, useCallback } from "react";
import { X } from "lucide-react";
import {
  catalogHasActiveFilters,
  getCatalogSortLabel,
} from "@/features/catalog/lib/catalog-sort-label";
import { findCategoryById } from "@/features/catalog/lib/catalog-category-tree";
import type { Category } from "@/features/categories/types";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type CatalogActiveFilterChipsProps = {
  categories: Category[];
  activeCategoryId?: number | null;
  className?: string;
};

function Chip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex max-w-full items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-950 transition-colors hover:bg-brand-100"
    >
      <span className="truncate">{label}</span>
      <X className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
    </button>
  );
}

/*
 * شرائح الفلاتر النشطة — فوق الشبكة مع إمكانية الإزالة السريعة.
 */
export function CatalogActiveFilterChips({
  categories,
  activeCategoryId,
  className,
}: CatalogActiveFilterChipsProps) {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();

  const pushParams = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const p = new URLSearchParams(searchParams.toString());
      mutate(p);
      p.delete("page");
      const qs = p.toString();
      startTransition(() => {
        router.push(qs ? `${ROUTES.PRODUCTS}?${qs}` : ROUTES.PRODUCTS, {
          scroll: false,
        });
      });
    },
    [router, searchParams],
  );

  if (!catalogHasActiveFilters(searchParams) && !activeCategoryId) return null;

  const chips: { key: string; label: string; clear: () => void }[] = [];

  if (searchParams.get("featured") === "true") {
    chips.push({
      key: "featured",
      label: "مميز",
      clear: () =>
        pushParams((p) => {
          p.delete("featured");
        }),
    });
  }

  const category = findCategoryById(categories, activeCategoryId);
  if (category) {
    chips.push({
      key: `cat-${category.id}`,
      label: category.name,
      clear: () =>
        pushParams((p) => {
          p.delete("category");
        }),
    });
  }

  const min = searchParams.get("min_price");
  const max = searchParams.get("max_price");
  if (min || max) {
    chips.push({
      key: "price",
      label: min && max ? `${min}–${max} ج.م` : min ? `من ${min} ج.م` : `حتى ${max} ج.م`,
      clear: () =>
        pushParams((p) => {
          p.delete("min_price");
          p.delete("max_price");
        }),
    });
  }

  const orderby = searchParams.get("orderby");
  if (orderby && orderby !== "popularity") {
    chips.push({
      key: "sort",
      label: getCatalogSortLabel(searchParams),
      clear: () =>
        pushParams((p) => {
          p.delete("orderby");
          p.delete("order");
        }),
    });
  } else if (searchParams.get("order") === "asc") {
    chips.push({
      key: "sort",
      label: getCatalogSortLabel(searchParams),
      clear: () =>
        pushParams((p) => {
          p.delete("order");
        }),
    });
  }

  if (chips.length === 0) return null;

  const clearAll = () => {
    startTransition(() => {
      router.push(ROUTES.PRODUCTS, { scroll: false });
    });
  };

  return (
    <div
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-2",
        className,
      )}
    >
      {chips.map((chip) => (
        <Chip key={chip.key} label={chip.label} onRemove={chip.clear} />
      ))}
      {chips.length > 1 ? (
        <button
          type="button"
          onClick={clearAll}
          className="text-[11px] font-bold text-brand-800 underline-offset-2 hover:underline"
        >
          مسح الكل
        </button>
      ) : null}
    </div>
  );
}
