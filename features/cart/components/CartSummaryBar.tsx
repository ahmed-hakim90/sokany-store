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
  /** Mobile dock: expand/collapse line list (does not fire when tapping checkout). */
  onSummaryClick?: () => void;
  /** `aria-expanded` for summary control when `onSummaryClick` is set. */
  summaryExpanded?: boolean;
  className?: string;
  /** Flat row inside mobile chrome — no nested card/shadow */
  embedded?: boolean;
};

export function CartSummaryBar({
  totalItems,
  totalPrice,
  lineCount,
  ctaLabel = "إتمام الطلب",
  onCheckout,
  onSummaryClick,
  summaryExpanded,
  className,
  embedded = false,
}: CartSummaryBarProps) {
  const lines = lineCount ?? undefined;
  const qtyLabel =
    lines != null
      ? `${lines} صنف · ${totalItems} قطعة`
      : `${totalItems} قطعة`;

  const summaryBlock = onSummaryClick ? (
    <button
      type="button"
      className="min-w-0 flex-1 basis-[min(100%,11rem)] rounded-md text-start outline-none ring-brand-500/0 transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-brand-500/40 sm:basis-auto"
      aria-expanded={summaryExpanded}
      aria-controls={embedded ? "mobile-cart-peek-lines" : undefined}
      aria-label={
        summaryExpanded ? "طي قائمة أصناف السلة" : "عرض أصناف السلة"
      }
      onClick={onSummaryClick}
    >
      <p className="truncate text-xs text-muted-foreground">{qtyLabel}</p>
      <PriceText
        amount={totalPrice}
        emphasized
        compact
        className="block min-w-0 whitespace-nowrap text-brand-950"
      />
      <p className="sr-only">Cart total {formatPrice(totalPrice)}</p>
    </button>
  ) : (
    <div className="min-w-0 flex-1 basis-[min(100%,11rem)] sm:basis-auto">
      <p className="truncate text-xs text-muted-foreground ">{qtyLabel}</p>
      <PriceText
        amount={totalPrice}
        emphasized
        compact
        className="block min-w-0 whitespace-nowrap text-brand-950 "
      />
    </div>
  );

  const body = (
    <>
      {summaryBlock}
      {onCheckout ? (
        <Button
          variant="dark"
          size="sm"
          className="shrink-0 self-center"
          onClick={(e) => {
            e.stopPropagation();
            onCheckout();
          }}
        >
          {ctaLabel}
        </Button>
      ) : null}
    </>
  );

  if (embedded) {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-x-3 gap-y-2 bg-white px-3 py-2.5 sm:flex-nowrap",
          className,
        )}
      >
        {body}
      </div>
    );
  }

  return (
    <Card
      variant="summary"
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 shadow-lg sm:flex-nowrap",
        className,
      )}
    >
      {body}
    </Card>
  );
}
