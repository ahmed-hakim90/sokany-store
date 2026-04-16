"use client";

import { MobileAccordionSection } from "@/components/ui/mobile-accordion-section";
import { cn } from "@/lib/utils";

export type ProductSpecItem = { label: string; value: string };

export type ProductSpecsListProps = {
  items: ProductSpecItem[];
  className?: string;
  /** Section heading */
  title?: string;
};

export function ProductSpecsList({
  items,
  className,
  title = "المواصفات والمعلومات",
}: ProductSpecsListProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn("border-t border-border pt-6", className)}>
      <MobileAccordionSection title={title} defaultOpen>
        <dl className="grid min-w-0 gap-3 sm:grid-cols-2">
          {items.map((row) => (
            <div
              key={`${row.label}-${row.value}`}
              className="flex min-w-0 flex-col gap-0.5 rounded-lg border border-border bg-surface-muted/40 px-3 py-2.5"
            >
              <dt className="text-xs font-medium text-muted-foreground">{row.label}</dt>
              <dd className="break-words text-sm font-medium text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      </MobileAccordionSection>
    </div>
  );
}
