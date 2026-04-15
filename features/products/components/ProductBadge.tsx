import { Badge } from "@/components/Badge";
import { cn } from "@/lib/utils";

export type ProductBadgeVariant = "sale" | "featured" | "outOfStock";

const styles: Record<ProductBadgeVariant, string> = {
  sale: "bg-red-100 text-red-800",
  featured: "bg-amber-100 text-amber-900",
  outOfStock: "bg-zinc-200 text-zinc-800",
};

const labels: Record<ProductBadgeVariant, string> = {
  sale: "عرض",
  featured: "مميز",
  outOfStock: "غير متوفر",
};

export function ProductBadge({
  variant,
  className,
}: {
  variant: ProductBadgeVariant;
  className?: string;
}) {
  return (
    <Badge
      className={cn(
        "px-1.5 py-0.5 text-[10px] font-semibold leading-tight sm:px-2 sm:text-[11px]",
        styles[variant],
        className,
      )}
    >
      {labels[variant]}
    </Badge>
  );
}
