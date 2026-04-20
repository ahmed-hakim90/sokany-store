import { cn, formatPrice } from "@/lib/utils";

export type PriceTextProps = {
  amount: number;
  compareAt?: number | null;
  emphasized?: boolean;
  compact?: boolean;
  /** Product tiles: soft pill + ring so the price reads as the purchase anchor. */
  presentation?: "default" | "tile";
  /** Applied to the main amount span (e.g. home product tiles). */
  amountClassName?: string;
  /** Applied to the crossed-out compare price when shown. */
  compareAtClassName?: string;
  className?: string;
};

export function PriceText({
  amount,
  compareAt,
  emphasized,
  compact,
  presentation = "default",
  amountClassName,
  compareAtClassName,
  className,
}: PriceTextProps) {
  const showOld =
    compareAt != null && compareAt > amount && Number.isFinite(compareAt);
  const tile = presentation === "tile";

  return (
    <span
      dir="ltr"
      className={cn(
        "inline-flex flex-wrap items-baseline gap-x-2 gap-y-0 tabular-nums tracking-wide",
        tile &&
          "rounded-lg bg-surface-muted/70 px-2 py-1 shadow-[0_1px_2px_rgb(15_23_42/0.05)] ring-1 ring-border/60 sm:px-2.5 sm:py-1",
        className,
      )}
    >
      <span
        className={cn(
          "font-semibold text-brand-900",
          tile && "font-bold text-brand-950 tracking-tight",
          emphasized && !compact && "text-2xl",
          emphasized && compact && "text-lg",
          !emphasized && !compact && "text-xs md:text-sm lg:text-base",
          !emphasized && compact && "text-sm",
          amountClassName,
        )}
      >
        {formatPrice(amount)}
      </span>
      {showOld ? (
        <span
          className={cn(
            "text-xs md:text-sm lg:text-base text-muted-foreground line-through",
            compareAtClassName,
          )}
        >
          {formatPrice(compareAt)}
        </span>
      ) : null}
    </span>
  );
}
