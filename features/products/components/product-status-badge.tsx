import { cn } from "@/lib/utils";
import { getProductCardBadge } from "@/features/products/lib/product-card-badge";
import type { Product } from "@/features/products/types";

export function ProductStatusBadge({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const badge = getProductCardBadge(product);
  if (!badge) return null;
  return (
    <span
      className={cn(
        "inline-flex w-fit rounded-md px-2 py-0.5 text-[10px] font-bold leading-tight sm:text-[11px]",
        badge.kind === "new"
          ? "border border-emerald-600/20 bg-emerald-600/10 text-emerald-950"
          : "border border-amber-500/30 bg-amber-500/10 text-amber-950",
        className,
      )}
    >
      {badge.label}
    </span>
  );
}
