"use client";

import { useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Drawer } from "vaul";
import { Button } from "@/components/Button";
import { useCart } from "@/hooks/useCart";
import { useMinMd } from "@/hooks/useMinMd";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  CartDrawerLines,
  CartDrawerPeekFooter,
} from "@/features/cart/components/cart-drawer-body";
import { useCartDrawerOpenStore } from "@/features/cart/store/useCartDrawerOpenStore";

export function DesktopCartDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const mdUp = useMinMd();
  const open = useCartDrawerOpenStore((s) => s.open);
  const setOpen = useCartDrawerOpenStore((s) => s.setOpen);
  const closeDrawer = useCartDrawerOpenStore((s) => s.closeDrawer);
  const { hasHydrated, items, updateProductQuantity, removeProduct } = useCart();

  useEffect(() => {
    if (!mdUp) closeDrawer();
  }, [mdUp, closeDrawer]);

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
    closeDrawer();
    router.push(ROUTES.CHECKOUT);
  }, [closeDrawer, router]);

  if (!mdUp) return null;

  const isEmpty = items.length === 0;

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
        <Drawer.Overlay className="fixed inset-0 z-[90] bg-slate-900/50" />
        <Drawer.Content
          id="desktop-cart-drawer-panel"
          className={cn(
            "fixed bottom-2 left-2 top-2 z-[100] flex h-[calc(100%-1rem)] max-h-[calc(100dvh-1rem)] min-w-0 max-w-none max-w-md flex-col rounded-2xl border border-border/80 bg-page outline-none",
          )}
        >
          <Drawer.Title className="border-b border-border/80 px-4 py-3 text-center font-display text-base font-semibold text-brand-950">
            سلة التسوق
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            {isEmpty
              ? "السلة فارغة. يمكنك تصفح المنتجات أو فتح صفحة السلة."
              : "تعديل الكميات أو إزالة الأصناف، ثم إتمام الطلب."}
          </Drawer.Description>

          {isEmpty ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">السلة فارغة حالياً.</p>
              <Button
                type="button"
                variant="primary"
                className="font-bold"
                onClick={() => {
                  closeDrawer();
                  router.push(ROUTES.PRODUCTS);
                }}
              >
                تصفح المنتجات
              </Button>
              <Link
                href={ROUTES.CART}
                className="text-xs font-medium text-brand-800 underline-offset-2 hover:underline"
              >
                فتح صفحة السلة
              </Link>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
                <CartDrawerLines
                  items={items}
                  onQuantityChange={updateProductQuantity}
                  onRemove={removeProduct}
                />
              </div>
              <CartDrawerPeekFooter onCheckout={goCheckout} showFullCartLink />
            </>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
