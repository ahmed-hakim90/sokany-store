"use client";

import { useCallback, useEffect, useState, startTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import { Drawer } from "vaul";
import { useCart } from "@/hooks/useCart";
import { formatPriceAmountCheckout } from "@/lib/format";
import { ROUTES } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";
import {
  CartDrawerLines,
  CartDrawerPeekFooter,
} from "@/features/cart/components/cart-drawer-body";
import { mobileCommercePeekSurfaceClass } from "@/components/layout/mobile-commerce-surface";

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
  const reduceMotion = useReducedMotion();

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
      ? `${lineCount} صنف • ${totalItems} قطعة`
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
        <div className="px-4 pb-0">
          <motion.div
            className={cn(
              mobileCommercePeekSurfaceClass,
              "flex min-h-[3.25rem] items-center justify-between gap-3 px-4 py-3",
            )}
            initial={
              reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 400, damping: 32 }
            }
          >
            <Drawer.Trigger asChild disabled={!hasHydrated}>
              <button
                type="button"
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-start gap-1 rounded-2xl text-start outline-none ring-brand-500/0 transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-brand-500/40",
                  !hasHydrated && "pointer-events-none opacity-80",
                )}
                aria-expanded={open}
                aria-haspopup="dialog"
                aria-label={open ? "إغلاق تفاصيل السلة" : "فتح تفاصيل السلة"}
              >
                <div
                  className="flex w-full min-w-0 items-baseline justify-end gap-1.5"
                  dir="ltr"
                >
                  <span className="font-display text-2xl font-black tabular-nums tracking-tight text-brand-950">
                    {formatPriceAmountCheckout(totalPrice)}
                  </span>
                  <span className="translate-y-px text-[0.7rem] font-semibold text-brand-900/65">
                    ج.م
                  </span>
                </div>
                <p className="w-full truncate text-start text-xs text-muted-foreground">
                  {qtyLabel}
                </p>
                <span className="sr-only">
                  الإجمالي {formatPrice(totalPrice)} — اضغط لعرض تفاصيل السلة
                </span>
              </button>
            </Drawer.Trigger>
            <button
              type="button"
              className={cn(
                "inline-flex shrink-0 items-center gap-3 rounded-full border border-brand-800/12 bg-brand-300 py-1.5 ps-5 pe-2 text-sm font-black text-brand-950 shadow-md transition-[transform,colors] hover:bg-brand-400/85 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goCheckout();
              }}
            >
              <span className="max-w-[9rem] truncate sm:max-w-none">
                إلى الدفع
              </span>
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-brand-950 shadow-sm ring-1 ring-black/[0.06]"
                aria-hidden
              >
                <ArrowLeft className="size-5 rtl:rotate-180" />
              </span>
            </button>
          </motion.div>
        </div>
      ) : null}

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[90] bg-slate-950/55 backdrop-blur-[2px]" />
        <Drawer.Content
          className={cn(
            "fixed z-[100] flex max-h-[min(88dvh,56rem)] min-h-0 min-w-0 flex-col overflow-hidden outline-none",
            "inset-x-4 bottom-5 max-h-[min(88dvh,56rem)] sm:inset-x-6 sm:max-w-xl",
            "rounded-3xl border border-white/50 bg-white/90 shadow-[0_28px_64px_-18px_rgba(15,23,42,0.45)] backdrop-blur-2xl backdrop-saturate-150",
            "pb-[env(safe-area-inset-bottom)]",
          )}
        >
          <Drawer.Handle className="mx-auto mt-3 h-1.5 w-11 shrink-0 rounded-full bg-slate-300/90" />
          <div className="relative shrink-0 border-b border-slate-200/60 bg-gradient-to-b from-slate-50/80 to-transparent px-4 pb-2 pt-0.5">
            <button
              type="button"
              className="absolute end-2 top-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100/95 text-slate-700 shadow-sm ring-1 ring-slate-900/5 transition-colors hover:bg-slate-200/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
              onClick={() => setOpen(false)}
              aria-label="إغلاق"
            >
              <MobileCartCloseIcon />
            </button>
            <Drawer.Title className="px-10 pt-1 text-center font-display text-base font-bold tracking-tight text-slate-900">
              سلة التسوق
            </Drawer.Title>
          </div>
          <Drawer.Description className="sr-only">
            تعديل الكميات أو إزالة الأصناف، ثم إتمام الطلب من الأسفل.
          </Drawer.Description>
          <p className="px-4 pb-2 pt-1.5 text-center text-[11px] text-slate-500">
            اسحب للأسفل للإغلاق أو زر الإغلاق أعلاه
          </p>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-100/50 px-3 py-2 sm:px-4">
            <CartDrawerLines
              variant="premium"
              items={items}
              onQuantityChange={updateProductQuantity}
              onRemove={removeProduct}
            />
          </div>

          <CartDrawerPeekFooter variant="premium" onCheckout={goCheckout} />
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
