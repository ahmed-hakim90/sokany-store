"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Drawer } from "vaul";
import { Button } from "@/components/Button";
import { useWishlist } from "@/hooks/useWishlist";
import { useMinMd } from "@/hooks/useMinMd";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { WishlistDrawerLines } from "@/features/wishlist/components/wishlist-drawer-lines";
import { useWishlistDrawerOpenStore } from "@/features/wishlist/store/useWishlistDrawerOpenStore";

export function DesktopWishlistDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const mdUp = useMinMd();
  const open = useWishlistDrawerOpenStore((s) => s.open);
  const setOpen = useWishlistDrawerOpenStore((s) => s.setOpen);
  const closeDrawer = useWishlistDrawerOpenStore((s) => s.closeDrawer);
  const { hasHydrated, items, removeFromWishlist } = useWishlist();

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
          id="desktop-wishlist-drawer-panel"
          className={cn(
            "fixed bottom-2 left-2 top-2 z-[100] flex h-[calc(100%-1rem)] max-h-[calc(100dvh-1rem)] w-full max-w-md flex-col rounded-2xl border border-border/80 bg-page outline-none",
          )}
        >
          <Drawer.Title className="border-b border-border/80 px-4 py-3 text-center font-display text-base font-semibold text-brand-950">
            المفضلة
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            {isEmpty
              ? "لا توجد منتجات في المفضلة. يمكنك تصفح المنتجات وإضافة المزيد."
              : "قائمة المنتجات المحفوظة. يمكنك فتح المنتج أو إزالته من القائمة."}
          </Drawer.Description>

          {isEmpty ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">لا توجد منتجات في المفضلة بعد.</p>
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
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
              <WishlistDrawerLines items={items} onRemove={removeFromWishlist} />
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
