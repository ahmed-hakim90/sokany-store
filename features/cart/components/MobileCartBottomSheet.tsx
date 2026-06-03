"use client";

/**
 * سلة موبايل — كبسولة ثابتة + drawer
 * بالعامية: كبسولة حمراء فوق التبويب السفلي طول ما في أصناف؛ الضغط يفتح ورقة تعديل السلة (vaul) من غير بوب أب ملخص عريض.
 *
 * تخطيط (موبايل فقط، max-lg):
 * - عمود الكروم: كبسولة مدمجة (صور + «عرض السلة») ثم bottom nav.
 * - الـ drawer: ورقة من الأسفل بقائمة الأصناف و«إتمام الطلب».
 */
import { useCallback, useEffect, useState, startTransition } from "react";
import { usePathname } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import { Drawer } from "vaul";
import { useCart } from "@/hooks/useCart";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  CartDrawerLines,
  CartDrawerLinesSkeleton,
  CartDrawerPeekFooter,
  getCartDrawerDiscount,
} from "@/features/cart/components/cart-drawer-body";
import { MobileCartCompactPeek } from "@/features/cart/components/mobile-cart-compact-peek";
import { CartFreeShippingProgressBar } from "@/features/cart/components/cart-free-shipping-progress";
import { CartPromoRow } from "@/features/cart/components/cart-promo-row";
import { CartUpsellSection } from "@/features/cart/components/cart-upsell-section";
import { getCartShippingUi } from "@/lib/cart-shipping-ui";

type MobileCartBottomSheetProps = {
  showCartSummary: boolean;
};

export function MobileCartBottomSheet({
  showCartSummary,
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
    updatingLineId,
  } = useCart();
  const [open, setOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

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
    setCheckoutLoading(true);
    setOpen(false);
    router.push(ROUTES.CHECKOUT);
  }, [router]);

  const openDrawer = useCallback(() => {
    if (!hasHydrated) return;
    setOpen(true);
  }, [hasHydrated]);

  if (!showCartSummary) return null;

  const lineCount = items.length;
  const discount = getCartDrawerDiscount(items);
  const displaySubtotal = totalPrice + discount;
  const shippingUi = getCartShippingUi(totalPrice);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      modal
      shouldScaleBackground={false}
      dismissible
    >
      <div className="flex justify-center px-4 pb-0">
        <MobileCartCompactPeek
          items={items}
          totalItems={totalItems}
          totalPrice={totalPrice}
          hasHydrated={hasHydrated}
          drawerOpen={open}
          disabled={!hasHydrated}
          onClick={openDrawer}
        />
      </div>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[90] bg-slate-950/55 backdrop-blur-[2px]" />
        <Drawer.Content
          className={cn(
            "fixed z-[100] flex max-h-[min(88dvh,56rem)] min-h-0 min-w-0 flex-col overflow-hidden outline-none",
            "inset-x-0 bottom-0",
            "rounded-t-3xl border-t border-x-0 border-b-0 border-white/50 bg-white/95 shadow-[0_-8px_32px_-4px_rgba(15,23,42,0.18)] backdrop-blur-2xl backdrop-saturate-150",
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
              سلة التسوق ({lineCount})
            </Drawer.Title>
          </div>
          <Drawer.Description className="sr-only">
            تعديل الكميات أو إزالة الأصناف، ثم إتمام الطلب من الأسفل.
          </Drawer.Description>
          <p className="px-4 pb-2 pt-1.5 text-center text-[11px] text-slate-500">
            اسحب للأسفل للإغلاق أو زر الإغلاق أعلاه
          </p>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-slate-100/50 px-3 py-2 sm:px-4">
            {shippingUi.progress ? (
              <CartFreeShippingProgressBar progress={shippingUi.progress} />
            ) : null}
            {!hasHydrated ? (
              <CartDrawerLinesSkeleton rows={Math.min(items.length || 2, 3)} />
            ) : (
              <CartDrawerLines
                variant="premium"
                items={items}
                updatingLineId={updatingLineId}
                onQuantityChange={updateProductQuantity}
                onRemove={removeProduct}
              />
            )}
            {/* <CartUpsellSection className="pb-0" /> */}
            <CartPromoRow />
          </div>

          <CartDrawerPeekFooter
            variant="premium"
            onCheckout={goCheckout}
            checkoutLoading={checkoutLoading}
            subtotal={displaySubtotal}
            total={totalPrice}
            shippingLabel={shippingUi.shippingLabel}
            discount={discount}
          />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function MobileCartCloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-5 w-5", className)}
      fill="none"
      aria-hidden
    >
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
