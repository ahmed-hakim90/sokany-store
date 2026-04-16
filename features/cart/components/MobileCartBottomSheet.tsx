"use client";

import { memo, useCallback, useEffect, useState, startTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Drawer } from "vaul";
import { AppImage } from "@/components/AppImage";
import { Button } from "@/components/Button";
import { PriceText } from "@/components/ui/price-text";
import { QtyControl } from "@/components/ui/qty-control";
import { IconButton } from "@/components/ui/icon-button";
import { useCart } from "@/hooks/useCart";
import { ROUTES } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";
import type { CartItem } from "@/features/cart/types";

type MobileCartBottomSheetProps = {
  showCartSummary: boolean;
};

export function MobileCartBottomSheet({
  showCartSummary,
}: MobileCartBottomSheetProps) {
  const pathname = usePathname();
  const router = useRouter();
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

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[90] bg-slate-900/50" />
        <Drawer.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-[100] mx-auto flex max-h-[96dvh] w-full max-w-lg flex-col rounded-t-2xl border border-border/80 bg-page outline-none",
            "pb-[env(safe-area-inset-bottom)]",
          )}
        >
          <Drawer.Handle className="mx-auto mt-2.5 h-1.5 w-12 shrink-0 rounded-full bg-border" />
          <Drawer.Title className="px-4 pt-2 text-center font-display text-sm font-semibold text-brand-950">
            سلة التسوق
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            تعديل الكميات أو إزالة الأصناف، ثم إتمام الطلب من الأسفل.
          </Drawer.Description>
          <p className="px-4 pb-2 text-center text-[11px] text-muted-foreground">
            اسحب للأسفل للإغلاق
          </p>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 sm:px-4">
            <ul className="space-y-2.5 pb-3" role="list">
              {items.map((item) => (
                <CartSheetLine
                  key={item.productId}
                  item={item}
                  onQuantityChange={updateProductQuantity}
                  onRemove={removeProduct}
                />
              ))}
            </ul>
          </div>

          <div className="shrink-0 border-t border-border bg-white px-4 pt-3 shadow-[0_-4px_20px_-6px_rgba(15,23,42,0.08)]">
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full font-bold"
              onClick={goCheckout}
            >
              الانتقال للدفع
            </Button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

const CartSheetLine = memo(function CartSheetLine({
  item,
  onQuantityChange,
  onRemove,
}: {
  item: CartItem;
  onQuantityChange: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}) {
  return (
    <li className="flex gap-3 rounded-xl border border-border/80 bg-white p-3 shadow-sm">
      <Link
        href={ROUTES.PRODUCT(item.productId)}
        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-image-well"
      >
        <AppImage
          src={item.thumbnail}
          alt=""
          fill
          sizes="64px"
          className="object-cover"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={ROUTES.PRODUCT(item.productId)}
            className="line-clamp-2 text-start text-sm font-semibold text-foreground hover:text-brand-600"
          >
            {item.name}
          </Link>
          <IconButton
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 text-muted-foreground hover:text-red-600"
            aria-label={`إزالة ${item.name}`}
            onClick={() => onRemove(item.productId)}
          >
            <TrashIcon />
          </IconButton>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-brand-900" dir="ltr">
            {formatPrice(item.price)}
          </span>
          <QtyControl
            value={item.quantity}
            min={1}
            max={999}
            onChange={(q) => onQuantityChange(item.productId, q)}
          />
        </div>
        <div className="flex justify-end">
          <PriceText
            amount={item.price * item.quantity}
            compact
            className="text-xs text-muted-foreground"
          />
        </div>
      </div>
    </li>
  );
});

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14" strokeLinecap="round" />
      <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" strokeLinecap="round" />
    </svg>
  );
}
