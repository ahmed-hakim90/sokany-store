"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import { toast } from "sonner";
import {
  Check,
  CreditCard,
  Headphones,
  LockKeyhole,
  MapPinned,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Truck,
} from "lucide-react";
import { AppImage } from "@/components/AppImage";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { readOrderConfirmationSession } from "@/features/checkout/lib/order-confirmation-session";
import type {
  CheckoutSuccessSnapshot,
  OrderConfirmationSessionPayload,
} from "@/features/checkout/types";
import type { CartItem } from "@/features/cart/types";
import { ProductCarouselRow } from "@/features/products/components/product-carousel-row";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { ROUTES } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";

/*
 * صفحة تأكيد الطلب: على الموبايل تظهر الخطوات ثم بطاقات الطلب في عمود واحد مع sidebar
 * تحتها؛ من lg تتحول إلى grid بعمود رئيسي وsidebar لملخص الطلب والدعم. أسفل الصفحة
 * يوجد صف توصيات أفقي قابل للتمرير (`ProductCarouselRow`) ليكمل العميل التسوق.
 */

const steps = ["عربة التسوق", "بيانات الشحن", "طريقة الدفع", "تأكيد الطلب"];

type ConfirmationItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  thumbnail: string;
  sku?: string;
};

function toInternalTrackingHref(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return url;
  }
}

function paymentMethodLabel(
  snapshot: CheckoutSuccessSnapshot | null | undefined,
  orderTitle: string | undefined,
) {
  if (orderTitle?.trim()) return orderTitle;
  switch (snapshot?.paymentMethod) {
    case "card": return "بطاقة بنكية";
    case "fawry": return "فوري";
    case "paymob": return "باي موب";
    default: return "الدفع عند الاستلام";
  }
}

function paymentMethodDescription(
  snapshot: CheckoutSuccessSnapshot | null | undefined,
  paymentStatus: "success" | "failed" | null,
) {
  switch (snapshot?.paymentMethod) {
    case "fawry":
      if (snapshot.onlinePayment?.referenceNumber) {
        return "استخدم كود فوري الظاهر بالأسفل للدفع من أي منفذ فوري.";
      }
      if (paymentStatus === "success") return "تم تأكيد الدفع الإلكتروني بنجاح.";
      if (paymentStatus === "failed") return "لم يكتمل الدفع. يمكنك المحاولة مجدداً من تفاصيل الطلب.";
      return "سيتم تأكيد حالة الدفع الإلكتروني تلقائياً.";
    case "paymob":
      if (paymentStatus === "success") return "تم تأكيد الدفع الإلكتروني بنجاح.";
      if (paymentStatus === "failed") return "لم يكتمل الدفع. يمكنك المحاولة مجدداً من تفاصيل الطلب.";
      return "سيتم تأكيد حالة الدفع الإلكتروني تلقائياً.";
    case "card":
      return "سيتم تأكيد حالة الدفع ضمن تفاصيل الطلب.";
    default:
      return "ادفع عند استلام طلبك من مندوب الشحن.";
  }
}

function OnlinePaymentBanner({ status }: { status: "success" | "failed" }) {
  if (status === "success") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Check className="h-4 w-4" aria-hidden />
        </span>
        تم الدفع الإلكتروني بنجاح — سيظهر الطلب بحالة «قيد المعالجة» خلال لحظات.
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
        !
      </span>
      <div>
        <p className="font-semibold">لم يكتمل الدفع</p>
        <p className="mt-0.5 text-red-700/80">
          تم حجز الطلب لكن لم يتم خصم المبلغ. يمكنك إعادة المحاولة أو التواصل مع الدعم بذكر رقم الطلب.
        </p>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong,
  tone,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "success" | "discount";
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 text-sm",
        strong ? "font-bold text-brand-950" : "text-muted-foreground",
        tone === "success" && "text-emerald-700",
        tone === "discount" && "text-emerald-700",
      )}
    >
      <span>{label}</span>
      <span className="tabular-nums" dir="ltr">
        {value}
      </span>
    </div>
  );
}

function Stepper() {
  return (
    <nav
      className="rounded-2xl border border-border/70 bg-white px-3 py-4 shadow-sm sm:px-5"
      aria-label="خطوات إتمام الطلب"
    >
      <ol className="grid grid-cols-4 items-start gap-2">
        {steps.map((label, index) => {
          const active = index === steps.length - 1;
          return (
            <li key={label} className="relative flex flex-col items-center gap-2 text-center">
              {index < steps.length - 1 ? (
                <span className="absolute start-1/2 top-4 hidden h-px w-full bg-border sm:block" />
              ) : null}
              <span
                className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold",
                  active
                    ? "border-brand-950 bg-brand-950 text-white"
                    : "border-emerald-100 bg-emerald-50 text-emerald-700",
                )}
              >
                {active ? "4" : <Check className="h-4 w-4" aria-hidden />}
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground sm:text-xs">
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function InfoCard({
  icon,
  title,
  children,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/70 bg-white p-4 shadow-sm sm:p-5",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-base font-bold text-brand-950">{title}</h2>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-950 text-white">
          {icon}
        </span>
      </div>
      {children}
    </section>
  );
}

function MissingOrderState() {
  const router = useTransitionRouter();

  return (
    <div className="rounded-3xl border border-border/70 bg-white p-8 text-center shadow-sm">
      <PackageCheck className="mx-auto h-12 w-12 text-brand-900" aria-hidden />
      <h1 className="mt-4 font-display text-2xl font-bold text-brand-950">
        رقم الطلب غير متاح
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        لم نتمكن من قراءة تفاصيل التأكيد من هذه الجلسة. يمكنك متابعة الطلب من صفحة
        طلباتي أو إدخال رقم الطلب في صفحة التتبع.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button type="button" variant="primary" onClick={() => router.push(ROUTES.MY_ORDERS)}>
          طلباتي
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(ROUTES.ORDER_TRACKING)}
        >
          تتبع الطلب
        </Button>
      </div>
    </div>
  );
}

export function OrderConfirmationPageContent() {
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id")?.trim() ?? "";
  const paymentParam = searchParams.get("payment") as "success" | "failed" | null;
  const paymentStatus: "success" | "failed" | null =
    paymentParam === "success" || paymentParam === "failed" ? paymentParam : null;
  const [payload, setPayload] = useState<OrderConfirmationSessionPayload | null>(null);
  const [loaded, setLoaded] = useState(false);
  const { getCartLineQuantity, setProductLineQuantity, replaceAllItems } = useCart();
  const recommendations = useProducts(
    { orderby: "popularity", order: "desc", per_page: 6 },
    { enabled: loaded && Boolean(payload) },
  );

  useEffect(() => {
    setPayload(orderId ? readOrderConfirmationSession(orderId) : null);
    setLoaded(true);
  }, [orderId]);

  const order = payload?.order ?? null;
  const snapshot = payload?.snapshot ?? null;
  const trackHref = useMemo(() => {
    if (order?.trackingUrl) return toInternalTrackingHref(order.trackingUrl);
    return order?.id
      ? `${ROUTES.ORDER_TRACKING}?q=${encodeURIComponent(String(order.id))}`
      : ROUTES.ORDER_TRACKING;
  }, [order]);

  const items: ConfirmationItem[] = useMemo(() => {
    if (snapshot?.items.length) return snapshot.items;
    return (
      order?.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        thumbnail: item.image,
      })) ?? []
    );
  }, [order, snapshot]);

  const subtotal = order?.subtotal ?? snapshot?.subtotal ?? 0;
  const shippingTotal = order?.shippingTotal ?? snapshot?.shippingFee ?? 0;
  const total = order?.total ?? snapshot?.total ?? 0;
  const discount = Math.max(0, subtotal + shippingTotal - total);
  const displayOrderRef = order?.orderNumber || (order?.id ? String(order.id) : "");
  const carouselStatus = recommendations.isPending
    ? "loading"
    : recommendations.data?.items.length
      ? "ready"
      : "empty";

  const handleReorder = useCallback(() => {
    if (!items.length) return;
    const cartItems: CartItem[] = items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      thumbnail: item.thumbnail,
      sku: item.sku ?? "",
    }));
    replaceAllItems(cartItems);
    toast.success("تمت إضافة المنتجات إلى السلة", {
      description: `${cartItems.length} منتج جاهز للطلب`,
    });
    router.push(ROUTES.CART);
  }, [items, replaceAllItems, router]);

  return (
    <div className="min-h-0 min-w-0 flex-1 bg-page py-4 md:py-6">
      <Container className="mx-auto max-w-7xl">
        {!loaded ? (
          <div className="rounded-3xl border border-border/70 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-medium text-brand-950">جاري تحميل تفاصيل الطلب…</p>
          </div>
        ) : !payload ? (
          <>
            {paymentStatus === "failed" ? (
              <div className="space-y-4">
                <OnlinePaymentBanner status="failed" />
                <MissingOrderState />
              </div>
            ) : (
              <MissingOrderState />
            )}
          </>
        ) : (
          <div className="space-y-4 md:space-y-5">
            <Stepper />

            {paymentStatus ? (
              <OnlinePaymentBanner status={paymentStatus} />
            ) : null}

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
              {/* العمود الرئيسي: نجاح الطلب ثم الشحن والدفع وتفاصيل المنتجات. */}
              <main className="space-y-4">
                <section className="rounded-2xl border border-emerald-100 bg-white p-6 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/70">
                    <Check className="h-8 w-8" aria-hidden />
                  </div>
                  <h1 className="mt-4 font-display text-2xl font-bold text-brand-950 sm:text-3xl">
                    تم إتمام طلبك بنجاح!
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    شكراً لك. تم استلام طلبك وسنرسل لك تفاصيل التأكيد والمتابعة قريباً.
                  </p>
                  {displayOrderRef ? (
                    <p className="mt-3 text-sm font-bold text-emerald-700">
                      رقم الطلب{" "}
                      <span dir="ltr" className="tabular-nums">
                        #{displayOrderRef}
                      </span>
                    </p>
                  ) : null}
                </section>

                <InfoCard
                  title="معلومات الشحن"
                  icon={<MapPinned className="h-4 w-4" aria-hidden />}
                >
                  <div className="space-y-2 text-sm leading-6 text-muted-foreground">
                    <p className="font-semibold text-brand-950">
                      {snapshot?.shipping.name || "العميل"}
                    </p>
                    {snapshot?.shipping.phone ? (
                      <p dir="ltr">{snapshot.shipping.phone}</p>
                    ) : null}
                    <p>
                      {[
                        snapshot?.shipping.address1,
                        snapshot?.shipping.address2,
                        snapshot?.shipping.city,
                        snapshot?.shipping.state,
                        snapshot?.shipping.postcode,
                      ]
                        .filter(Boolean)
                        .join("، ") || "تم حفظ بيانات الشحن مع الطلب."}
                    </p>
                    <p className="text-xs font-medium text-brand-900">
                      موعد التوصيل المتوقع: خلال 1-3 أيام عمل
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="mt-2"
                      onClick={() => router.push(trackHref)}
                    >
                      تتبع الطلب
                    </Button>
                  </div>
                </InfoCard>

                <InfoCard
                  title="طريقة الدفع"
                  icon={<CreditCard className="h-4 w-4" aria-hidden />}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white",
                        snapshot?.paymentMethod === "fawry"
                          ? "bg-[#1f6e43]"
                          : snapshot?.paymentMethod === "paymob"
                            ? "bg-[#3c4db8]"
                            : "bg-emerald-50 text-emerald-700",
                      )}
                    >
                      <CreditCard className="h-8 w-8" aria-hidden />
                    </div>
                    <div className="min-w-0 text-sm leading-6 text-muted-foreground">
                      <p className="font-semibold text-brand-950">
                        {paymentMethodLabel(snapshot, order?.paymentMethodTitle)}
                      </p>
                      <p>{paymentMethodDescription(snapshot, paymentStatus)}</p>
                      {snapshot?.onlinePayment?.referenceNumber ? (
                        <div className="mt-2 rounded-xl border border-[#1f6e43]/20 bg-[#1f6e43]/10 px-3 py-2 text-brand-950">
                          <p className="text-xs font-semibold text-muted-foreground">
                            كود فوري للدفع
                          </p>
                          <p dir="ltr" className="text-lg font-black tabular-nums">
                            {snapshot.onlinePayment.referenceNumber}
                          </p>
                          {snapshot.onlinePayment.instructions ? (
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              {snapshot.onlinePayment.instructions}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </InfoCard>

                <section className="rounded-2xl border border-border/70 bg-white p-4 shadow-sm sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="font-display text-base font-bold text-brand-950">
                      تفاصيل الطلب ({items.length} منتج)
                    </h2>
                    <ShoppingBag className="h-5 w-5 text-muted-foreground" aria-hidden />
                  </div>
                  {items.length > 0 ? (
                    <>
                      <ul className="space-y-3">
                        {items.map((item) => (
                          <li
                            key={`${item.productId}-${item.sku ?? item.name}`}
                            className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] gap-3 rounded-2xl border border-border/60 bg-page/35 p-3"
                          >
                            <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-border bg-image-well">
                              <AppImage src={item.thumbnail} alt="" fill sizes="64px" />
                              <span className="absolute end-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-950 px-1 text-[10px] font-bold text-white">
                                {item.quantity}
                              </span>
                            </div>
                            <div className="min-w-0 self-center">
                              <p className="line-clamp-2 text-sm font-bold text-brand-950">
                                {item.name}
                              </p>
                              {item.sku ? (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  SKU: {item.sku}
                                </p>
                              ) : null}
                            </div>
                            <p
                              className="self-center text-sm font-bold tabular-nums text-brand-950"
                              dir="ltr"
                            >
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </li>
                        ))}
                      </ul>
                      <Button
                        type="button"
                        variant="secondary"
                        className="mt-4 w-full gap-2"
                        onClick={handleReorder}
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden />
                        إعادة طلب نفس المنتجات
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      تم تأكيد الطلب. يمكنك متابعة التفاصيل من صفحة تتبع الطلب.
                    </p>
                  )}
                </section>
              </main>

              {/* الشريط الجانبي: ملخص مالي، ضمانات، دعم، وتحميل التطبيق؛ يلتصق أعلى الشاشة من lg. */}
              <aside className="space-y-4 lg:sticky lg:top-6">
                <section className="rounded-2xl border border-border/70 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="font-display text-base font-bold text-brand-950">
                      ملخص الطلب
                    </h2>
                    <ShoppingBag className="h-5 w-5 text-muted-foreground" aria-hidden />
                  </div>
                  <div className="space-y-3">
                    <SummaryRow label="المجموع الفرعي" value={formatPrice(subtotal)} />
                    <SummaryRow
                      label="تكلفة الشحن"
                      value={shippingTotal > 0 ? formatPrice(shippingTotal) : "مجاني"}
                      tone="success"
                    />
                    {discount > 0 ? (
                      <SummaryRow
                        label="خصم"
                        value={`- ${formatPrice(discount)}`}
                        tone="discount"
                      />
                    ) : null}
                    <div className="border-t border-border pt-3">
                      <SummaryRow label="الإجمالي" value={formatPrice(total)} strong />
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    شامل كل الرسوم المضافة للطلب.
                  </p>
                </section>

                <section className="grid gap-2 rounded-2xl border border-border/70 bg-white p-4 shadow-sm">
                  {[
                    { title: "توصيل سريع", body: "خلال 1-3 أيام عمل", icon: Truck },
                    { title: "ضمان سنة", body: "على عيوب الصناعة", icon: ShieldCheck },
                    { title: "دفع آمن", body: "دفع عند الاستلام أو أونلاين", icon: LockKeyhole },
                    { title: "استبدال واسترجاع", body: "خلال 14 يوم", icon: RotateCcw },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.title}
                        className="flex items-center gap-3 rounded-xl bg-page/60 p-3"
                      >
                        <Icon className="h-5 w-5 text-emerald-600" aria-hidden />
                        <span>
                          <span className="block text-sm font-bold text-brand-950">
                            {item.title}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {item.body}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </section>

                <section className="rounded-2xl border border-border/70 bg-white p-5 text-center shadow-sm">
                  <Headphones className="mx-auto h-9 w-9 text-brand-950" aria-hidden />
                  <h2 className="mt-3 font-display text-base font-bold text-brand-950">
                    تحتاج مساعدة؟
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    فريق الدعم متاح لمتابعة طلبك أو تعديل بيانات التواصل.
                  </p>
                  <Button
                    type="button"
                    variant="dark"
                    className="mt-4 w-full"
                    onClick={() => router.push(ROUTES.CONTACT)}
                  >
                    تواصل معنا
                  </Button>
                </section>

              </aside>
            </div>

            {/* توصيات ما بعد الشراء: صف أفقي على الجوال والديسكتوب لإبقاء العميل داخل المتجر. */}
            <section className="rounded-2xl border border-border/70 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-brand-950">
                    قد يعجبك ايضا
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    منتجات مختارة تكمل طلبك.
                  </p>
                </div>
                <Smartphone className="hidden h-6 w-6 text-muted-foreground sm:block" aria-hidden />
              </div>
              <ProductCarouselRow
                status={carouselStatus}
                products={recommendations.data?.items ?? []}
                getCartLineQuantity={getCartLineQuantity}
                onCartLineQuantityChange={setProductLineQuantity}
                empty={
                  <p className="rounded-xl bg-page/60 p-4 text-sm text-muted-foreground">
                    لا توجد توصيات متاحة الآن.
                  </p>
                }
              />
            </section>
          </div>
        )}
      </Container>
    </div>
  );
}
