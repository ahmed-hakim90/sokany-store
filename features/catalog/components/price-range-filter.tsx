"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

export const CATALOG_PRICE_DEFAULT_MAX = 15_000;
const DEFAULT_MAX = CATALOG_PRICE_DEFAULT_MAX;

export type PriceRangeFilterProps = {
  minPrice?: number;
  maxPrice?: number;
  onApply: (range: { min: number | null; max: number | null }) => void;
  /** When false, hide inline تطبيق / إعادة التعيين (e.g. catalog filter drawer). */
  showActionButtons?: boolean;
  /** Fires when min/max inputs change (for draft + parent CTA). */
  onValuesChange?: (min: number, max: number) => void;
  /** إخفاء عنوان «نطاق السعر» الداخلي عندما يعرض الأب عنوان القسم. */
  hideBuiltInHeading?: boolean;
};

export function PriceRangeFilter({
  minPrice,
  maxPrice,
  onApply,
  showActionButtons = true,
  onValuesChange,
  hideBuiltInHeading = false,
}: PriceRangeFilterProps) {
  const [min, setMin] = useState(() => minPrice ?? 0);
  const [max, setMax] = useState(() => maxPrice ?? DEFAULT_MAX);

  return (
    <div className="space-y-2">
      {hideBuiltInHeading ? null : (
        <p className="text-xs font-semibold text-foreground">نطاق السعر (ج.م)</p>
      )}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm">
        <span className="text-muted-foreground">من</span>
        <label className="sr-only" htmlFor="catalog-price-min">
          الحد الأدنى للسعر بالجنيه
        </label>
        <input
          id="catalog-price-min"
          type="number"
          min={0}
          inputMode="numeric"
          placeholder="0"
          className="h-9 min-w-[4.5rem] flex-1 rounded-lg border border-border bg-white px-2 text-sm font-semibold tabular-nums text-foreground outline-none ring-brand-500/0 focus-visible:ring-2 sm:max-w-[6.5rem] sm:flex-none"
          value={min || ""}
          onChange={(e) => {
            const next = Number.parseInt(e.target.value, 10) || 0;
            setMin(next);
            onValuesChange?.(next, max);
          }}
        />
        <span className="text-muted-foreground">إلى</span>
        <label className="sr-only" htmlFor="catalog-price-max">
          الحد الأقصى للسعر بالجنيه
        </label>
        <input
          id="catalog-price-max"
          type="number"
          min={0}
          inputMode="numeric"
          className="h-9 min-w-[4.5rem] flex-1 rounded-lg border border-border bg-white px-2 text-sm font-semibold tabular-nums text-foreground outline-none ring-brand-500/0 focus-visible:ring-2 sm:max-w-[6.5rem] sm:flex-none"
          value={max || ""}
          onChange={(e) => {
            const next = Number.parseInt(e.target.value, 10) || DEFAULT_MAX;
            setMax(next);
            onValuesChange?.(min, next);
          }}
        />
        <span className="text-xs font-medium text-muted-foreground">ج.م</span>
      </div>
      {showActionButtons ? (
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          className="bg-brand-500 font-bold text-black hover:bg-brand-400"
          onClick={() =>
            onApply({
              min: min > 0 ? min : null,
              max: max > 0 && max < DEFAULT_MAX ? max : null,
            })
          }
        >
          تطبيق
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => {
            setMin(0);
            setMax(DEFAULT_MAX);
            onApply({ min: null, max: null });
          }}
        >
          إعادة التعيين
        </Button>
      </div>
      ) : null}
    </div>
  );
}
