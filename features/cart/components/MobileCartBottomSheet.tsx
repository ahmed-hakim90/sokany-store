"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import { usePathname } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import { Drawer } from "vaul";
import { Button } from "@/components/Button";
import { PriceText } from "@/components/ui/price-text";
import { useCart } from "@/hooks/useCart";
import { ROUTES } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";
import {
  CartDrawerLines,
  CartDrawerPeekFooter,
} from "@/features/cart/components/cart-drawer-body";

type MobileCartBottomSheetProps = {
  showCartSummary: boolean;
  /** يخفي شريط الملخص فوق الـ bottom nav (مثلاً عند سكرول للأسفل) مع بقاء الـ drawer يعمل إن وُجد. */
  peekHidden?: boolean;
};

export function MobileCartBottomSheet({
  showCartSummary,
  peekHidden = false,
}: MobileCartBottomSheetProps) {
  const pathname = usePathname();
  const router = useTransitionRouter();
  const {
    hasHydrated,
    items,
    totalItems,
    totalPrice,
    updateProductQuantity,
    removeProduct,
  } = useCart();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!showCartSummary || totalItems === 0) {
      startTransition(() => setOpen(false));
    }
  }, [showCartSummary, totalItems]);

  useEffect(() => {
    startTransition(() => setOpen(false));
  }, [pathname]);

  const onOpenChange = useCallback(
    (next: boolean) => {
      if (next && !hasHydrated) return;
      setOpen(next);
    },
    [hasHydrated],
  );

  const goCheckout = useCallback(() => {
    setOpen(false);
    router.push(ROUTES.CHECKOUT);
  }, [router]);

  if (!showCartSummary) return null;

  const lineCount = items.length;
  const qtyLabel =
    lineCount > 0
      ? `${lineCount} صنف · ${totalItems} قطعة`
      : `${totalItems} قطعة`;

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      modal
      shouldScaleBackground
      dismissible
    >
      {!peekHidden ? (
        <div className="min-h-[3.25rem] border-b border-border/80 bg-white shadow-[0_-6px_18px_-10px_rgba(15,23,42,0.14)]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5 sm:flex-nowrap">
            <Drawer.Trigger asChild disabled={!hasHydrated}>
              <button
                type="button"
                className={cn(
                  "min-w-0 flex-1 basis-[min(100%,11rem)] rounded-md text-start outline-none ring-brand-500/0 transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-brand-500/40 sm:basis-auto",
                  !hasHydrated && "pointer-events-none opacity-80",
                )}
                aria-expanded={open}
                aria-haspopup="dialog"
                aria-label={open ? "إغلاق تفاصيل السلة" : "فتح تفاصيل السلة"}
              >
                <p className="truncate text-xs text-muted-foreground">{qtyLabel}</p>
                <PriceText
                  amount={totalPrice}
                  emphasized
                  compact
                  className="block min-w-0 whitespace-nowrap text-brand-950 text-end"
                />
                <span className="sr-only">
                  الإجمالي {formatPrice(totalPrice)} — اضغط لعرض تفاصيل السلة
                </span>
              </button>
            </Drawer.Trigger>
            <Button
              variant="primary"
              size="sm"
              className="shrink-0 self-center font-bold"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goCheckout();
              }}
            >
              الانتقال للدفع
            </Button>
          </div>
        </div>
      ) : null}

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[90] bg-slate-900/50" />
        <Drawer.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-[100] mx-auto flex max-h-[96dvh] min-w-0 max-w-3xl flex-col rounded-t-2xl border border-border/80 bg-page outline-none sm:max-w-4xl md:max-w-5xl",
            "pb-[env(safe-area-inset-bottom)]",
          )}
        >
          <Drawer.Handle className="mx-auto mt-2.5 h-1.5 w-12 shrink-0 rounded-full bg-border" />
          <div className="relative shrink-0 px-4 pt-1">
            <button
              type="button"
              className="absolute end-2 top-0 inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-950 transition-colors hover:bg-surface-muted/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              onClick={() => setOpen(false)}
              aria-label="إغلاق"
            >
              <MobileCartCloseIcon />
            </button>
            <Drawer.Title className="px-10 pt-1 text-center font-display text-sm font-semibold text-brand-950">
              سلة التسوق
            </Drawer.Title>
          </div>
          <Drawer.Description className="sr-only">
            تعديل الكميات أو إزالة الأصناف، ثم إتمام الطلب من الأسفل.
          </Drawer.Description>
          <p className="px-4 pb-2 pt-0.5 text-center text-[11px] text-muted-foreground">
            اسحب للأسفل للإغلاق أو زر الإغلاق أعلاه
          </p>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 sm:px-4">
            <CartDrawerLines
              items={items}
              onQuantityChange={updateProductQuantity}
              onRemove={removeProduct}
            />
          </div>

          <CartDrawerPeekFooter onCheckout={goCheckout} />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function MobileCartCloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
