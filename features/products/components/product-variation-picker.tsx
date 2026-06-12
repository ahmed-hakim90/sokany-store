"use client";

import { cn } from "@/lib/utils";

export function ProductVariationPicker({
  attributeNames,
  optionsByName,
  selected,
  onSelect,
  disabled = false,
  className,
}: {
  attributeNames: string[];
  optionsByName: Record<string, string[]>;
  selected: Record<string, string>;
  onSelect: (name: string, option: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  if (attributeNames.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)} aria-label="خيارات المنتج">
      {attributeNames.map((name) => {
        const options = optionsByName[name] ?? [];
        if (options.length === 0) return null;
        return (
          <div key={name} className="space-y-2">
            <p className="text-xs font-bold text-slate-700">{name}</p>
            <div className="flex flex-wrap gap-2">
              {options.map((option) => {
                const isSelected = selected[name] === option;
                return (
                  <button
                    key={`${name}-${option}`}
                    type="button"
                    disabled={disabled}
                    aria-pressed={isSelected}
                    className={cn(
                      "min-h-10 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors",
                      isSelected
                        ? "border-brand-700 bg-brand-100 text-brand-950 ring-1 ring-brand-400/50"
                        : "border-slate-200 bg-white text-slate-800 hover:border-slate-300",
                      disabled && "opacity-60",
                    )}
                    onClick={() => onSelect(name, option)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
