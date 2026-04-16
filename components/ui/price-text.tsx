import { cn, formatPrice } from "@/lib/utils";

export type PriceTextProps = {
  amount: number;
  compareAt?: number | null;
  emphasized?: boolean;
  compact?: boolean;
  /** Applied to the main amount span (e.g. home product tiles). */
  amountClassName?: string;
  className?: string;
};

export function PriceText({
  amount,
  compareAt,
  emphasized,
  compact,
  amountClassName,
  className,
}: PriceTextProps) {
  const showOld =
    compareAt != null && compareAt > amount && Number.isFinite(compareAt);

  return (
    <span
      dir="ltr"
      className={cn(
        "inline-flex flex-wrap items-baseline gap-x-2 gap-y-0 tabular-nums tracking-wide",
        className,
      )}
    >
      <span
        className={cn(
          "font-semibold text-brand-900",
          emphasized && !compact && "text-2xl",
          emphasized && compact && "text-lg",
          !emphasized && !compact && "text-base",
          !emphasized && compact && "text-sm",
          amountClassName,
        )}
      >
        {formatPrice(amount)}
      </span>
      {showOld ? (
        <span className="text-sm text-muted-foreground line-through">
          {formatPrice(compareAt)}
        </span>
      ) : null}
    </span>
  );
}
