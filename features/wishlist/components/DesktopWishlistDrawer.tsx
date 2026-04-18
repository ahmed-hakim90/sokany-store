"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Drawer } from "vaul";
import { Button } from "@/components/Button";
import { IconButton } from "@/components/ui/icon-button";
import { useWishlist } from "@/hooks/useWishlist";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { WishlistDrawerLines } from "@/features/wishlist/components/wishlist-drawer-lines";
import { useWishlistDrawerOpenStore } from "@/features/wishlist/store/useWishlistDrawerOpenStore";

export function DesktopWishlistDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const open = useWishlistDrawerOpenStore((s) => s.open);
  const setOpen = useWishlistDrawerOpenStore((s) => s.setOpen);
  const closeDrawer = useWishlistDrawerOpenStore((s) => s.closeDrawer);
  const { hasHydrated, items, removeFromWishlist } = useWishlist();

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
        <Drawer.Overlay className="fixed inset-0 z-[90] cursor-pointer bg-slate-900/50" />
        <Drawer.Content
          id="desktop-wishlist-drawer-panel"
          className={cn(
            "fixed z-[100] flex min-w-0 flex-col bg-page outline-none",
            /* الموبايل: عرض أقل من الشاشة بقليل عشان يبان الـ overlay والضغط عليه يقفل؛ مش full-bleed */
            "max-md:left-0 max-md:top-0 max-md:bottom-0 max-md:h-full max-md:max-h-[100dvh] max-md:w-[min(22rem,calc(100vw-1.5rem))] max-md:rounded-none max-md:border-0 max-md:border-e max-md:border-border/80 max-md:pt-[env(safe-area-inset-top)] max-md:pb-[env(safe-area-inset-bottom)] max-md:shadow-xl",
            "md:bottom-2 md:left-2 md:top-2 md:h-[calc(100%-1rem)] md:max-h-[calc(100dvh-1rem)] md:max-w-md md:rounded-2xl md:border md:border-border/80 md:pt-0 md:pb-0",
          )}
        >
          <div className="relative shrink-0 border-b border-border/80">
            <IconButton
              type="button"
              variant="ghost"
              size="md"
              aria-label="إغلاق المفضلة"
              className="absolute start-2 top-1/2 z-10 -translate-y-1/2 text-brand-950"
              onClick={() => closeDrawer()}
            >
              <CloseGlyph />
            </IconButton>
            <Drawer.Title className="px-12 py-3 text-center font-display text-base font-semibold text-brand-950 sm:px-14">
              المفضلة
            </Drawer.Title>
          </div>
          <Drawer.Description className="sr-only">
            {isEmpty
              ? "لا توجد منتجات في المفضلة. يمكنك تصفح المنتجات وإضافة المزيد. استخدم زر الإغلاق أو اضغط على المنطقة المعتمة خارج اللوحة للإغلاق."
              : "قائمة المنتجات المحفوظة. يمكنك فتح المنتج أو إزالته من القائمة. استخدم زر الإغلاق أو اضغط على المنطقة المعتمة خارج اللوحة للإغلاق."}
          </Drawer.Description>

          {isEmpty ? (
            <div className="flex min-h-[40dvh] flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center sm:min-h-0 sm:px-6 sm:py-12">
              <p className="max-w-xs text-sm text-muted-foreground sm:max-w-none sm:text-base">
                لا توجد منتجات في المفضلة بعد.
              </p>
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
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4">
              <WishlistDrawerLines items={items} onRemove={removeFromWishlist} />
            </div>
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
