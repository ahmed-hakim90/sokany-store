"use client";

import { useMemo } from "react";
import { Link } from "next-view-transitions";
import { useTransitionRouter } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { StorefrontEmptyState } from "@/components/StorefrontEmptyState";
import { IconButton } from "@/components/ui/icon-button";
import { QtyControl } from "@/components/ui/qty-control";
import { CartTrashIcon } from "@/features/cart/components/cart-drawer-body";
import { CartFreeShippingProgressBar } from "@/features/cart/components/cart-free-shipping-progress";
import { CartMobileCheckoutDock } from "@/features/cart/components/cart-mobile-checkout-dock";
import { CartPromoRow } from "@/features/cart/components/cart-promo-row";
import { CartSummaryPanel } from "@/features/cart/components/CartSummaryPanel";
import { CartUpsellSection } from "@/features/cart/components/cart-upsell-section";
import { useCart } from "@/hooks/useCart";
import { getCartShippingUi } from "@/lib/cart-shipping-ui";
import { ROUTES } from "@/lib/constants";
import { surfacePanelClass } from "@/lib/storefront-surfaces";
import { cn, formatPrice } from "@/lib/utils";

/**
 * صفحة السلة
 * بالعامية: مصدر الحقيقة من `useCart`؛ الموبايل فيه dock للإتمام، الديسكتوب عمودين؛ الفوتر متخفي من `FooterGate`.
 *
 * التفاصيل البصرية تحت.
 */
/*
 * صفحة السلة (/cart)
 *
 * — الجوال: بطاقات صنف (صورة، عنوان، سعر وحدة، كمية، إجمالي السطر)؛ dock إتمام ثابت؛ ملخص أسفل القائمة.
 * — من lg: عمود المنتجات | ملخص لاصق (كوبون، شحن، إجمالي، CTA)؛ اقتراحات بعرض الشاشة تحت الصف.
 * — الفوتر العام مُخفى على هذا المسار عبر `FooterGate`.
 */
export function CartPageContent() {
  const router = useTransitionRouter();
  const { items, totalPrice, isEmpty, updateProductQuantity, removeProduct, updatingLineId } =
    useCart();

  const shippingUi = useMemo(() => getCartShippingUi(totalPrice), [totalPrice]);

  const summaryBeforeTotal = useMemo(() => {
    if (!shippingUi.progress) return null;
    return <CartFreeShippingProgressBar progress={shippingUi.progress} />;
  }, [shippingUi.progress]);

  const previewLimit = Math.max(items.length, 1);

  const checkout = () => {
    router.push(ROUTES.CHECKOUT);
  };

  return (
    <Container className="py-6 sm:py-10">
      <h1 className="font-display text-lg font-bold tracking-tight text-brand-950 sm:text-2xl md:text-3xl">
        سلة التسوق
      </h1>

      {isEmpty ? (
        <div className="mt-6 space-y-8 pb-8 sm:mt-8">
          <StorefrontEmptyState
            title="السلة فارغة"
            description="ابدأ بإضافة منتجات من أقسامنا أو من صفحة العروض."
            action={
              <div className="flex flex-col items-center gap-4">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-2xl"
                  aria-hidden
                >
                  🛒
                </span>
                <Button
                  type="button"
                  size="lg"
                  className="min-h-[52px] min-w-[min(100%,18rem)] px-8 text-base font-bold"
                  onClick={() => router.push(ROUTES.PRODUCTS)}
                >
                  ابدأ التسوق الآن
                </Button>
                <p className="text-sm text-muted-foreground">أقسام يزورها الزبائن كثيراً</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => router.push(ROUTES.CATEGORY("kitchen-supplies"))}
                  >
                    المطبخ
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() =>
                      router.push(ROUTES.CATEGORY("home-appliances"))
                    }
                  >
                    الأجهزة المنزلية
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => router.push(ROUTES.CATEGORY("personal-care"))}
                  >
                    العناية الشخصية
                  </Button>
                </div>
              </div>
            }
          />
          <CartUpsellSection />
        </div>
      ) : (
        <>
          <div className="mt-6 grid min-w-0 gap-6 pb-28 sm:mt-8 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start lg:pb-0">
            <div className="min-w-0 space-y-3 sm:space-y-4">
              {items.map((item) => {
                const lineTotal = item.price * item.quantity;
                const lineUpdating = updatingLineId === item.productId;
                return (
                <div
                  key={item.productId}
                  className={cn(
                    surfacePanelClass,
                    "flex flex-col gap-3 p-3 sm:flex-row sm:items-stretch sm:gap-4 sm:p-4",
                  )}
                >
                  <div className="relative mx-auto h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-image-well sm:mx-0 sm:h-24 sm:w-24">
                    <AppImage
                      src={item.thumbnail}
                      alt={item.name}
                      fill
                      sizes="96px"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-2 sm:gap-3">
                      <div className="min-w-0">
                        <Link
                          href={ROUTES.PRODUCT(item.productId)}
                          className="text-sm font-semibold leading-snug hover:text-brand-600"
                        >
                          {item.name}
                        </Link>
                        <p className="text-[11px] text-zinc-600 sm:text-xs">SKU: {item.sku}</p>
                      </div>
                      <IconButton
                        type="button"
                        variant="ghost"
                        size="lg"
                        className="shrink-0 text-muted-foreground hover:text-red-600"
                        aria-label={`حذف ${item.name} من السلة`}
                        onClick={() => removeProduct(item.productId)}
                      >
                        <CartTrashIcon className="h-5 w-5" />
                      </IconButton>
                    </div>
                    <div className="flex flex-wrap items-end justify-between gap-2 sm:gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(item.price)} للوحدة
                        </p>
                        <div className="relative">
                          {lineUpdating ? (
                            <span
                              className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-white/85"
                              aria-hidden
                            >
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                            </span>
                          ) : null}
                          <QtyControl
                            value={item.quantity}
                            min={1}
                            max={999}
                            disabled={lineUpdating}
                            touchComfortable
                            onChange={(quantity) =>
                              updateProductQuantity(item.productId, quantity)
                            }
                          />
                        </div>
                      </div>
                      <div className="text-end">
                        <p className="text-[10px] font-medium text-muted-foreground">الإجمالي</p>
                        <p className="text-base font-bold text-foreground">
                          {formatPrice(lineTotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>

            <aside className="hidden space-y-4 lg:sticky lg:top-24 lg:block lg:self-start">
              <CartSummaryPanel
                items={items}
                subtotal={totalPrice}
                total={totalPrice}
                shippingLabel={shippingUi.shippingLabel}
                beforeTotal={summaryBeforeTotal}
                previewLimit={previewLimit}
                footer={
                  <Button
                    type="button"
                    className="min-h-12 min-w-0 max-w-none font-bold"
                    size="lg"
                    onClick={checkout}
                  >
                    إتمام الطلب
                  </Button>
                }
              />
              <CartPromoRow />
            </aside>
          </div>

          <div className="mt-4 space-y-4 sm:mt-6 lg:mt-8">
            <div className="space-y-4 lg:hidden">
              <CartSummaryPanel
                items={items}
                subtotal={totalPrice}
                total={totalPrice}
                shippingLabel={shippingUi.shippingLabel}
                beforeTotal={summaryBeforeTotal}
                previewLimit={previewLimit}
              />
              <CartPromoRow />
              <Button
                type="button"
                size="lg"
                className="h-12 w-full font-bold shadow-sm"
                onClick={checkout}
              >
                إتمام الطلب
              </Button>
            </div>

            <CartUpsellSection />
          </div>

          <CartMobileCheckoutDock total={totalPrice} onCheckout={checkout} />
        </>
      )}
    </Container>
  );
}
