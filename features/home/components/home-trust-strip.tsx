import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TrustItem = {
  label: string;
  icon: ReactNode;
  description?: string;
  /** When true, tile is hidden below `md` (e.g. third pillar on compact mobile). */
  hideBelowMd?: boolean;
};

export type HomeTrustStripProps = {
  items: TrustItem[];
  className?: string;
};

export function HomeTrustStrip({ items, className }: HomeTrustStripProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4",
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "flex min-w-0 items-start gap-3 rounded-2xl bg-white px-3 py-3 shadow-[0_4px_18px_-6px_rgba(15,23,42,0.1)] ring-1 ring-black/[0.04] sm:px-4 sm:py-3.5",
            item.hideBelowMd && "hidden md:flex",
          )}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-950 [&_svg]:stroke-[1.85]">
            {item.icon}
          </span>
          <div className="min-w-0 flex-1 text-start">
            <p className="text-xs font-bold leading-snug text-brand-950 sm:text-sm">{item.label}</p>
            {item.description ? (
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground sm:text-xs">
                {item.description}
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
