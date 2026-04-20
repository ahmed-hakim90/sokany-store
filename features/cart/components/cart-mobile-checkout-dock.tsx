"use client";

import { Button } from "@/components/Button";
import { PriceText } from "@/components/ui/price-text";
import { cn } from "@/lib/utils";

/** Sticky checkout strip above `MobileCommerceChrome` — only on small screens. */
export function CartMobileCheckoutDock({
  total,
  onCheckout,
  className,
}: {
  total: number;
  onCheckout: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 z-40 border-t border-border/70 bg-white/92 px-3 pt-2 shadow-[0_-6px_24px_-10px_rgba(15,23,42,0.12)] backdrop-blur-sm lg:hidden",
        "pb-[max(0.5rem,env(safe-area-inset-bottom))]",
        className,
      )}
      style={{
        bottom: "var(--mobile-commerce-chrome-height, 4.5rem)",
      }}
    >
      <div className="mx-auto flex max-w-3xl items-center gap-2.5 md:max-w-5xl">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium text-muted-foreground">الإجمالي</p>
          <PriceText
            amount={total}
            emphasized
            className="text-lg font-bold leading-tight text-brand-950"
          />
        </div>
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="min-h-11 min-w-[8.5rem] shrink-0 px-4 text-sm font-bold shadow-sm sm:min-h-12 sm:min-w-[9.5rem] sm:px-5 sm:text-base"
          onClick={onCheckout}
        >
          إتمام الطلب
        </Button>
      </div>
    </div>
  );
}
