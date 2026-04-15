import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TrustItem = {
  label: string;
  icon: ReactNode;
};

export type HomeTrustStripProps = {
  items: TrustItem[];
  className?: string;
};

export function HomeTrustStrip({ items, className }: HomeTrustStripProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="flex min-w-0 items-center gap-2.5 rounded-2xl bg-white px-3 py-2.5 shadow-[0_4px_18px_-6px_rgba(15,23,42,0.1)] ring-1 ring-black/[0.04]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-page text-black">
            {item.icon}
          </span>
          <span className="text-[11px] font-semibold leading-snug text-black sm:text-xs">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
