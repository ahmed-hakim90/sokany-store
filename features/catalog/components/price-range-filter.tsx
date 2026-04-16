"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

const DEFAULT_MAX = 15_000;

export type PriceRangeFilterProps = {
  minPrice?: number;
  maxPrice?: number;
  onApply: (range: { min: number | null; max: number | null }) => void;
};

export function PriceRangeFilter({
  minPrice,
  maxPrice,
  onApply,
}: PriceRangeFilterProps) {
  const [min, setMin] = useState(() => minPrice ?? 0);
  const [max, setMax] = useState(() => maxPrice ?? DEFAULT_MAX);

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-foreground">نطاق السعر (ج.م)</p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="catalog-price-min">
          الحد الأدنى
        </label>
        <input
          id="catalog-price-min"
          type="number"
          min={0}
          inputMode="numeric"
          className="h-9 w-[5.5rem] rounded-lg border border-border bg-white px-2 text-sm font-medium text-foreground outline-none ring-brand-500/0 focus-visible:ring-2"
          value={min || ""}
          onChange={(e) => setMin(Number.parseInt(e.target.value, 10) || 0)}
        />
        <span className="text-xs text-muted-foreground">—</span>
        <label className="sr-only" htmlFor="catalog-price-max">
          الحد الأقصى
        </label>
        <input
          id="catalog-price-max"
          type="number"
          min={0}
          inputMode="numeric"
          className="h-9 w-[5.5rem] rounded-lg border border-border bg-white px-2 text-sm font-medium text-foreground outline-none ring-brand-500/0 focus-visible:ring-2"
          value={max || ""}
          onChange={(e) =>
            setMax(Number.parseInt(e.target.value, 10) || DEFAULT_MAX)
          }
        />
      </div>
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
    </div>
  );
}
