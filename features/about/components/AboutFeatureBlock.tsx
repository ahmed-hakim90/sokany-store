import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AboutFeatureItem = {
  title: string;
  description: string;
  icon?: ReactNode;
};

export type AboutFeatureBlockProps = {
  items: AboutFeatureItem[];
  className?: string;
  columns?: 2 | 3;
};

export function AboutFeatureBlock({
  items,
  className,
  columns = 3,
}: AboutFeatureBlockProps) {
  if (items.length === 0) return null;

  const grid =
    columns === 2
      ? "grid gap-4 sm:grid-cols-2"
      : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={cn(grid, className)}>
      {items.map((item, index) => (
        <Card
          key={`${item.title}-${index}`}
          variant="surface"
          className="flex flex-col gap-3 p-5 transition hover:border-brand-300 hover:shadow-md"
        >
          {item.icon ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-900">
              {item.icon}
            </div>
          ) : null}
          <h3 className="font-display text-lg font-semibold text-brand-950">{item.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
        </Card>
      ))}
    </div>
  );
}
