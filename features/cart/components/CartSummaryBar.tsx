import { Button } from "@/components/Button";
import { Card } from "@/components/ui/card";
import { PriceText } from "@/components/ui/price-text";
import { cn, formatPrice } from "@/lib/utils";

export type CartSummaryBarProps = {
  totalItems: number;
  totalPrice: number;
  /** Distinct line items; defaults to treating totalItems as quantity sum. */
  lineCount?: number;
  ctaLabel?: string;
  onCheckout?: () => void;
  className?: string;
};

export function CartSummaryBar({
  totalItems,
  totalPrice,
  lineCount,
  ctaLabel = "إتمام الطلب",
  onCheckout,
  className,
}: CartSummaryBarProps) {
  const lines = lineCount ?? undefined;
  const qtyLabel =
    lines != null
      ? `${lines} صنف · ${totalItems} قطعة`
      : `${totalItems} قطعة`;

  return (
    <Card
      variant="summary"
      className={cn(
        "flex items-center gap-3 px-4 py-3 shadow-lg",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{qtyLabel}</p>
        <PriceText amount={totalPrice} emphasized compact className="text-brand-950" />
        <p className="sr-only">Cart total {formatPrice(totalPrice)}</p>
      </div>
      {onCheckout ? (
        <Button size="sm" className="shrink-0" onClick={onCheckout}>
          {ctaLabel}
        </Button>
      ) : null}
    </Card>
  );
}
