"use client";

import { useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import { Drawer } from "vaul";
import { Button } from "@/components/Button";
import { IconButton } from "@/components/ui/icon-button";
import { PriceText } from "@/components/ui/price-text";
import { useWishlist } from "@/hooks/useWishlist";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  cartCheckoutPillButtonClassName,
  cartCheckoutPillIconClassName,
} from "@/features/cart/components/cart-drawer-body";
import { WishlistDrawerLines } from "@/features/wishlist/components/wishlist-drawer-lines";
import { WishlistDrawerTrustBadges } from "@/features/wishlist/components/wishlist-drawer-trust-badges";
import { useWishlistDrawerOpenStore } from "@/features/wishlist/store/useWishlistDrawerOpenStore";
import { STOREFRONT_Z } from "@/lib/storefront-overlay-z";
import { surfaceCtaStripClass } from "@/lib/storefront-surfaces";
import { StorefrontEmptyState } from "@/components/StorefrontEmptyState";
import { ArrowLeft } from "lucide-react";

/*
 * درج المفضلة:
 * — الموبايل: لوحة يسار بعرض أقل من الشاشة؛ الرأس ثابت، المحتوى يتمرر، والفوتر في أسفل اللوحة.
 * — من lg: كارت عائم مستدير على يسار الشاشة بعرض أكبر من الدرج القديم ليتسع للملخص والبطاقات.
 * — المحتوى غير الفارغ: ملخص أخضر فاتح، قائمة بطاقات قابلة للتمرير، ثم شريط ثقة وزران في الفوتر.
 */
export function DesktopWishlistDrawer() {
  const pathname = usePathname();
  const router = useTransitionRouter();
  const open = useWishlistDrawerOpenStore((s) => s.open);
  const setOpen = useWishlistDrawerOpenStore((s) => s.setOpen);
  const closeDrawer = useWishlistDrawerOpenStore((s) => s.closeDrawer);
  const { hasHydrated, items, totalCount, removeFromWishlist, clearAll } = useWishlist();

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
  const wishlistTotal = items.reduce((sum, item) => sum + item.price, 0);

  const goToCart = useCallback(() => {
    closeDrawer();
    router.push(ROUTES.CART);
  }, [closeDrawer, router]);

  const goToWishlist = useCallback(() => {
    closeDrawer();
    router.push(ROUTES.WISHLIST);
  }, [closeDrawer, router]);

  const clearWishlist = useCallback(() => {
    if (!window.confirm("هل تريد تفريغ المفضلة بالكامل؟")) return;
    clearAll();
  }, [clearAll]);

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
        <Drawer.Overlay
          className="fixed inset-0 cursor-pointer bg-slate-900/50"
          style={{ zIndex: STOREFRONT_Z.drawerOverlay }}
        />
        <Drawer.Content
          id="desktop-wishlist-drawer-panel"
          style={{ zIndex: STOREFRONT_Z.drawerPanel }}
          className={cn(
            "surface-panel fixed flex min-w-0 flex-col outline-none",
            /* الموبايل: عرض أقل من الشاشة بقليل عشان يبان الـ overlay والضغط عليه يقفل؛ مش full-bleed */
            "max-lg:left-0 max-lg:top-0 max-lg:bottom-0 max-lg:h-full max-lg:max-h-[100dvh] max-lg:w-[min(22rem,calc(100vw-1.5rem))] max-lg:rounded-none max-lg:border-0 max-lg:border-e max-lg:border-border/80 max-lg:pt-[env(safe-area-inset-top)] max-lg:pb-[env(safe-area-inset-bottom)] max-lg:shadow-xl",
            "lg:bottom-2 lg:left-2 lg:top-2 lg:h-[calc(100%-1rem)] lg:max-h-[calc(100dvh-1rem)] lg:w-[min(28rem,calc(100vw-1rem))] lg:max-w-lg lg:rounded-2xl lg:border lg:border-border/80 lg:pt-0 lg:pb-0",
          )}
        >
          {/*
            الرأس ثابت أعلى الدرج؛ زر الإغلاق على بداية السطر، والعنوان في المنتصف
            حتى يظل قريباً من التصميم المرجعي على الموبايل والديسكتوب.
          */}
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
              المفضلة ({items.length})
            </Drawer.Title>
          </div>
          <Drawer.Description className="sr-only">
            {isEmpty
              ? "لا توجد منتجات في المفضلة. يمكنك تصفح المنتجات وإضافة المزيد. استخدم زر الإغلاق أو اضغط على المنطقة المعتمة خارج اللوحة للإغلاق."
              : "قائمة المنتجات المحفوظة مع ملخص إجمالي المنتجات وأزرار فتح السلة أو صفحة المفضلة. يمكنك فتح المنتج أو إزالته من القائمة."}
          </Drawer.Description>

          {isEmpty ? (
            <div className="flex flex-1 flex-col justify-center px-4 py-8">
              <StorefrontEmptyState
                title="المفضلة فارغة"
                description="احفظ المنتجات التي تعجبك لتعود إليها لاحقاً."
                action={
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
                }
              />
            </div>
          ) : (
            <>
              {/*
                المحتوى القابل للتمرير يبدأ بالملخص ثم البطاقات؛ الفوتر منفصل
                حتى تظل أزرار «تفريغ» و«عرض المفضلة» ظاهرة أسفل اللوحة.
              */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4">
                <WishlistSummary
                  count={totalCount}
                  total={wishlistTotal}
                  onOpenCart={goToCart}
                />
                <div className="mt-4">
                  <WishlistDrawerLines
                    variant="premium"
                    items={items}
                    onRemove={removeFromWishlist}
                  />
                </div>
              </div>
              {/*
                الفوتر يحاكي المرجع: شريط ثقة صغير ثم صف أزرار ثابت،
                مع احترام safe-area في أسفل شاشات الموبايل.
              */}
              <div
                className={cn(
                  surfaceCtaStripClass,
                  "shrink-0 rounded-b-[1.35rem] border-t border-white/40 bg-white/50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md sm:px-4",
                )}
              >
                <WishlistDrawerTrustBadges />
                <button
                  type="button"
                  className={cn(
                    cartCheckoutPillButtonClassName,
                    "mt-3 w-full min-w-0 justify-between py-2.5",
                  )}
                  onClick={goToWishlist}
                >
                  <span className="min-w-0 truncate">عرض المفضلة</span>
                  <span className={cartCheckoutPillIconClassName} aria-hidden>
                    <ArrowLeft className="size-5 rtl:rotate-180" />
                  </span>
                </button>
                <button
                  type="button"
                  className="mt-2 w-full text-center text-xs font-semibold text-red-600"
                  onClick={clearWishlist}
                >
                  تفريغ المفضلة
                </button>
              </div>
            </>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function WishlistSummary({
  count,
  total,
  onOpenCart,
}: {
  count: number;
  total: number;
  onOpenCart: () => void;
}) {
  return (
    <section className="rounded-2xl border border-brand-200/70 bg-gradient-to-l from-brand-50 to-emerald-50/80 p-3 shadow-sm">
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-950 shadow-sm ring-1 ring-brand-900/[0.06]"
            aria-hidden
          >
            <BagGlyph />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted-foreground">
              إجمالي المنتجات ({count})
            </p>
            <PriceText
              amount={total}
              compact
              className="mt-1 text-xl font-black text-brand-950"
              amountClassName="text-xl font-black text-brand-950"
            />
          </div>
        </div>
        <Button
          type="button"
          variant="dark"
          className="h-12 shrink-0 rounded-xl px-4 text-sm font-bold"
          onClick={onOpenCart}
        >
          عرض السلة
          <CartGlyph />
        </Button>
      </div>
    </section>
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

function BagGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 8h12l-1 12H7L6 8z" />
      <path d="M9 8a3 3 0 016 0" />
    </svg>
  );
}

function CartGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 5h2l2 11h9l2-8H7" />
      <path d="M9 20h.01M17 20h.01" />
    </svg>
  );
}
