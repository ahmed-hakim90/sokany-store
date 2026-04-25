"use client";

import { useMemo } from "react";
import { Link } from "next-view-transitions";
import { useTransitionRouter } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { EmptyState } from "@/components/EmptyState";
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
import { formatPrice } from "@/lib/utils";

/*
 * صفحة السلة (/cart)
 *
 * — الجوال: بطاقات خفيفة ثم (ملخص + كوبون + زر إتمام) ثم «قد يعجبك أيضاً»؛ شريط إتمام ثابت فوق التنقل.
 * — من lg: عمود المنتجات | عمود ملخص + زر + كوبون؛ ثم اقتراحات بعرض الشاشة تحت الصف.
 * — الفوتر العام مُخفى على هذا المسار عبر `FooterGate`.
 */
export function CartPageContent() {
  const router = useTransitionRouter();
  const { items, totalPrice, isEmpty, updateProductQuantity, removeProduct } =
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
        <div className="mt-6 space-y-8 sm:mt-8">
          <EmptyState
            title="السلة فارغة"
            description="ابدأ بإضافة منتجات من أقسامنا أو من صفحة العروض."
            action={
              <div className="flex flex-col items-center gap-4">
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
        </div>
      ) : (
        <>
          <div className="mt-6 grid min-w-0 gap-6 pb-28 sm:mt-8 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:pb-0">
            <div className="min-w-0 space-y-3 sm:space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex flex-col gap-3 rounded-lg border border-black/[0.05] bg-white p-3 shadow-sm sm:flex-row sm:items-stretch sm:gap-4 sm:rounded-xl sm:border-black/[0.06] sm:p-4 sm:shadow-[0_2px_16px_-4px_rgba(15,23,42,0.07)]"
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
                    <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                      <div className="text-sm font-semibold text-foreground">
                        {formatPrice(item.price)}
                      </div>
                      <QtyControl
                        value={item.quantity}
                        min={1}
                        max={999}
                        touchComfortable
                        onChange={(quantity) =>
                          updateProductQuantity(item.productId, quantity)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="hidden space-y-4 lg:block">
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
