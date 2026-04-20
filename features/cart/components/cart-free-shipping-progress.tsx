"use client";

import type { CartFreeShippingProgress } from "@/lib/cart-shipping-ui";
import { freeShippingProgressHint } from "@/lib/cart-shipping-ui";
import { cn } from "@/lib/utils";

export function CartFreeShippingProgressBar({
  progress,
  className,
}: {
  progress: CartFreeShippingProgress;
  className?: string;
}) {
  const pct = progress.remaining <= 0 ? 100 : progress.percentTowardFree;

  return (
    <div
      className={cn(
        "rounded-xl border border-brand-500/25 bg-brand-500/5 px-3 py-2.5",
        className,
      )}
    >
      <p className="text-xs font-medium text-brand-950">{freeShippingProgressHint(progress)}</p>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-white/80 ring-1 ring-brand-900/10"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={freeShippingProgressHint(progress)}
      >
        <div
          className="h-full rounded-full bg-brand-500 transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
