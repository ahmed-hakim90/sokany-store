"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import { Drawer } from "vaul";
import { Button } from "@/components/Button";
import { IconButton } from "@/components/ui/icon-button";
import { useCart } from "@/hooks/useCart";
import { useMinLg } from "@/hooks/useMinLg";
import { ROUTES } from "@/lib/constants";
import { surfaceEmptyStateClass } from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";
import {
  CartDrawerLines,
  CartDrawerLinesSkeleton,
  CartDrawerPeekFooter,
  getCartDrawerDiscount,
} from "@/features/cart/components/cart-drawer-body";
import { CartFreeShippingProgressBar } from "@/features/cart/components/cart-free-shipping-progress";
import { CartPromoRow } from "@/features/cart/components/cart-promo-row";
import { CartUpsellSection } from "@/features/cart/components/cart-upsell-section";
import { useCartDrawerOpenStore } from "@/features/cart/store/useCartDrawerOpenStore";
import { getCartShippingUi } from "@/lib/cart-shipping-ui";

export function DesktopCartDrawer() {
  const pathname = usePathname();
  const router = useTransitionRouter();
  const lgUp = useMinLg();
  const open = useCartDrawerOpenStore((s) => s.open);
  const setOpen = useCartDrawerOpenStore((s) => s.setOpen);
  const closeDrawer = useCartDrawerOpenStore((s) => s.closeDrawer);
  const { hasHydrated, items, totalPrice, updateProductQuantity, removeProduct, updatingLineKey } =
    useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (!lgUp) closeDrawer();
  }, [lgUp, closeDrawer]);

  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  const onOpenChange = useCallback(
    (next: boolean) => {
      if (next && !hasHydrated) return;
      setOpen(next);
    },
    [hasHydrated, setOpen],
  );

  const goCheckout = useCallback(() => {
    setCheckoutLoading(true);
    closeDrawer();
    router.push(ROUTES.CHECKOUT);
  }, [closeDrawer, router]);

  if (!lgUp) return null;

  const isEmpty = items.length === 0;
  const discount = getCartDrawerDiscount(items);
  const displaySubtotal = totalPrice + discount;
  const shippingUi = getCartShippingUi(totalPrice);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      modal
      direction="left"
      dismissible
      shouldScaleBackground={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[90] cursor-pointer bg-slate-900/50" />
        <Drawer.Content
          id="desktop-cart-drawer-panel"
          className={cn(
            "surface-panel fixed bottom-2 left-2 top-2 z-[100] flex h-[calc(100%-1rem)] max-h-[calc(100dvh-1rem)] min-w-0 max-w-none max-w-md flex-col rounded-2xl outline-none",
          )}
        >
          <div className="relative shrink-0 border-b border-border/80">
            <IconButton
              type="button"
              variant="ghost"
              size="md"
              aria-label="إغلاق سلة التسوق"
              className="absolute start-2 top-1/2 z-10 -translate-y-1/2 text-brand-950"
              onClick={() => closeDrawer()}
            >
              <CloseGlyph />
            </IconButton>
            <Drawer.Title className="px-12 py-3 text-center font-display text-base font-semibold text-brand-950 sm:px-14">
              سلة التسوق ({items.length})
            </Drawer.Title>
          </div>
          <Drawer.Description className="sr-only">
            {isEmpty
              ? "السلة فارغة. يمكنك تصفح المنتجات أو فتح صفحة السلة."
              : "تعديل الكميات أو إزالة الأصناف، ثم إتمام الطلب."}
          </Drawer.Description>

          {isEmpty ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-10">
              <div className={cn(surfaceEmptyStateClass, "w-full max-w-sm border-solid py-8")}>
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-2xl" aria-hidden>
                  🛒
                </span>
                <p className="mt-4 font-display text-base font-semibold text-brand-950">السلة فارغة</p>
                <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
                  أضف منتجاتك المفضلة وتابع التسوق بسهولة.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  className="mt-5 font-bold"
                  onClick={() => {
                    closeDrawer();
                    router.push(ROUTES.PRODUCTS);
                  }}
                >
                  تصفح المنتجات
                </Button>
                <Link
                  href={ROUTES.CART}
                  className="mt-3 inline-block text-xs font-medium text-brand-800 underline-offset-2 hover:underline"
                >
                  فتح صفحة السلة
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-3">
                {shippingUi.progress ? (
                  <CartFreeShippingProgressBar progress={shippingUi.progress} />
                ) : null}
                {!hasHydrated ? (
                  <CartDrawerLinesSkeleton rows={Math.min(items.length || 2, 3)} />
                ) : (
                  <CartDrawerLines
                    items={items}
                    variant="premium"
                    updatingLineKey={updatingLineKey}
                    onQuantityChange={updateProductQuantity}
                    onRemove={removeProduct}
                  />
                )}
                <CartUpsellSection className="pb-0" />
                <CartPromoRow />
              </div>
              <CartDrawerPeekFooter
                variant="premium"
                onCheckout={goCheckout}
                checkoutLoading={checkoutLoading}
                showFullCartLink
                subtotal={displaySubtotal}
                total={totalPrice}
                shippingLabel={shippingUi.shippingLabel}
                discount={discount}
              />
            </>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function CloseGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
