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
      <h2 className="font-display text-lg font-semibold text-brand-950">
        {title}
      </h2>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((row) => (
          <div
            key={`${row.label}-${row.value}`}
            className="flex flex-col gap-0.5 rounded-lg border border-border bg-surface-muted/40 px-3 py-2.5"
          >
            <dt className="text-xs font-medium text-muted-foreground">{row.label}</dt>
            <dd className="text-sm font-medium text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
