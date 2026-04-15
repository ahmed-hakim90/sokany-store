import { cn } from "@/lib/utils";

export type StatItem = { value: string; label: string };

export type AboutStatsBlockProps = {
  items: readonly StatItem[];
  className?: string;
};

export function AboutStatsBlock({ items, className }: AboutStatsBlockProps) {
  return (
    <div
      className={cn(
        "grid gap-4 rounded-2xl border border-border bg-white/90 p-6 shadow-sm sm:grid-cols-3 sm:p-8",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="text-center sm:text-start">
          <p className="font-display text-3xl font-bold tracking-tight text-brand-950 sm:text-4xl" dir="ltr">
            {item.value}
          </p>
          <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
