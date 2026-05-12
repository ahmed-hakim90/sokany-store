"use client";

import { useTransitionRouter } from "next-view-transitions";
import {
  Check,
  CreditCard,
  Headphones,
  MapPinned,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { AppImage } from "@/components/AppImage";
import { Button } from "@/components/Button";
import type { CheckoutSuccessSnapshot } from "@/features/checkout/types";
import { ROUTES } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";

type PlacedOrderSummary = {
  id: number;
  orderNumber: string;
  trackingUrl: string;
  orderKey: string;
};

type OrderSuccessCelebrationProps = {
  open: boolean;
  order: PlacedOrderSummary | null;
  snapshot: CheckoutSuccessSnapshot | null;
  onDismiss: () => void;
};

function toInternalTrackingHref(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return url;
  }
}

function paymentMethodLabel(method: CheckoutSuccessSnapshot["paymentMethod"] | undefined) {
  if (method === "card") return "بطاقة بنكية";
  return "الدفع عند الاستلام";
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
        strong ? "font-bold text-slate-950" : "text-slate-600",
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

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-display text-base font-bold text-slate-950">{title}</h3>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white">
          {icon}
        </span>
      </div>
      {children}
    </section>
  );
}

/**
 * شاشة تأكيد الطلب بعد نجاح checkout: تعرض snapshot الطلب لأن السلة تُمسح بعد النجاح.
 */
export function OrderSuccessCelebration({
  open,
  order,
  snapshot,
  onDismiss,
}: OrderSuccessCelebrationProps) {
  const router = useTransitionRouter();

  if (!open) return null;

  const trackHref =
    (order?.trackingUrl ? toInternalTrackingHref(order.trackingUrl) : null) ??
    (order != null
      ? `${ROUTES.ORDER_TRACKING}?q=${encodeURIComponent(String(order.id))}`
      : ROUTES.ORDER_TRACKING);

  return (
    <div
      className="fixed inset-0 z-[200] overflow-y-auto bg-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-success-title"
      aria-describedby="order-success-desc"
    >
      <div className="mx-auto min-h-full w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 grid grid-cols-4 items-start gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {["عربة التسوق", "بيانات الشحن", "طريقة الدفع", "تأكيد الطلب"].map((label, index) => (
            <div key={label} className="relative flex flex-col items-center gap-2 text-center">
              {index < 3 ? (
                <span className="absolute start-1/2 top-4 hidden h-px w-full bg-slate-200 sm:block" />
              ) : null}
              <span
                className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold",
                  index === 3
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-emerald-100 bg-emerald-50 text-emerald-700",
                )}
              >
                {index === 3 ? "4" : <Check className="h-4 w-4" aria-hidden />}
              </span>
              <span className="text-[11px] font-semibold text-slate-600 sm:text-xs">
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <main className="space-y-4">
            <section className="rounded-2xl border border-emerald-100 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
                <Check className="h-8 w-8" aria-hidden />
              </div>
              <h2
                className="mt-4 font-display text-2xl font-bold text-slate-950 sm:text-3xl"
                id="order-success-title"
              >
                تم إتمام طلبك بنجاح
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600" id="order-success-desc">
                شكراً لك. تم استلام طلبك وسنرسل لك تفاصيل التأكيد والمتابعة قريباً.
              </p>
              {order != null ? (
                <p className="mt-3 text-sm font-bold text-emerald-700">
                  رقم الطلب{" "}
                  <span dir="ltr" className="tabular-nums">
                    #{order.orderNumber || order.id}
                  </span>
                </p>
              ) : null}
            </section>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard
                title="معلومات الشحن"
                icon={<MapPinned className="h-4 w-4" aria-hidden />}
              >
                {snapshot ? (
                  <div className="space-y-2 text-sm leading-6 text-slate-600">
                    <p className="font-semibold text-slate-950">{snapshot.shipping.name || "العميل"}</p>
                    <p dir="ltr">{snapshot.shipping.phone}</p>
                    <p>
                      {[snapshot.shipping.address1, snapshot.shipping.address2, snapshot.shipping.city, snapshot.shipping.state]
                        .filter(Boolean)
                        .join("، ")}
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="mt-2 border-slate-200 bg-white"
                      onClick={() => {
                        onDismiss();
                        router.push(trackHref);
                      }}
                    >
                      تتبع الطلب
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-600">تم حفظ بيانات الشحن مع الطلب.</p>
                )}
              </InfoCard>

              <InfoCard
                title="طريقة الدفع"
                icon={<CreditCard className="h-4 w-4" aria-hidden />}
              >
                <div className="space-y-2 text-sm leading-6 text-slate-600">
                  <p className="font-semibold text-slate-950">
                    {paymentMethodLabel(snapshot?.paymentMethod)}
                  </p>
                  <p>
                    {snapshot?.paymentMethod === "card"
                      ? "سيتم تأكيد حالة الدفع ضمن تفاصيل الطلب."
                      : "ادفع عند استلام طلبك من مندوب الشحن."}
                  </p>
                </div>
              </InfoCard>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-display text-base font-bold text-slate-950">
                  تفاصيل الطلب
                </h3>
                <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                  {snapshot?.items.length ?? 0} منتج
                </span>
              </div>
              {snapshot?.items.length ? (
                <ul className="space-y-3">
                  {snapshot.items.map((item) => (
                    <li
                      key={`${item.productId}-${item.sku}`}
                      className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3"
                    >
                      <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <AppImage src={item.thumbnail} alt="" fill sizes="64px" />
                        <span className="absolute end-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-950 px-1 text-[10px] font-bold text-white">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="min-w-0 self-center">
                        <p className="line-clamp-2 text-sm font-bold text-slate-950">
                          {item.name}
                        </p>
                        {item.sku ? (
                          <p className="mt-1 text-xs text-slate-500">SKU: {item.sku}</p>
                        ) : null}
                      </div>
                      <p className="self-center text-sm font-bold tabular-nums text-slate-950" dir="ltr">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-600">
                  تم تأكيد الطلب. يمكنك متابعة التفاصيل من صفحة تتبع الطلب.
                </p>
              )}
            </section>
          </main>

          <aside className="space-y-4 lg:sticky lg:top-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-display text-base font-bold text-slate-950">
                  ملخص الطلب
                </h3>
                <ShoppingBag className="h-5 w-5 text-slate-500" aria-hidden />
              </div>
              <div className="space-y-3">
                <SummaryRow
                  label="المجموع الفرعي"
                  value={formatPrice(snapshot?.subtotal ?? 0)}
                />
                <SummaryRow
                  label="تكلفة الشحن"
                  value={snapshot && snapshot.shippingFee > 0 ? formatPrice(snapshot.shippingFee) : "مجاني"}
                  tone="success"
                />
                <SummaryRow
                  label="الإجمالي"
                  value={formatPrice(snapshot?.total ?? 0)}
                  strong
                />
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                الأسعار النهائية وتفاصيل الشحن تظهر كذلك داخل صفحة تتبع الطلب.
              </p>
            </section>

            <section className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              {[
                { title: "توصيل سريع", body: "خلال 1-3 أيام عمل", icon: Truck },
                { title: "ضمان سنة", body: "على عيوب الصناعة", icon: ShieldCheck },
                { title: "دعم العملاء", body: "جاهزون للمساعدة", icon: Headphones },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <Icon className="h-5 w-5 text-emerald-600" aria-hidden />
                    <span>
                      <span className="block text-sm font-bold text-slate-950">{item.title}</span>
                      <span className="block text-xs text-slate-500">{item.body}</span>
                    </span>
                  </div>
                );
              })}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
              <Headphones className="mx-auto h-9 w-9 text-slate-800" aria-hidden />
              <h3 className="mt-3 font-display text-base font-bold text-slate-950">
                تحتاج مساعدة؟
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                فريق الدعم متاح لمتابعة طلبك أو تعديل بيانات التواصل.
              </p>
              <Button
                type="button"
                className="mt-4 w-full bg-slate-950 text-white hover:bg-slate-800"
                onClick={() => {
                  onDismiss();
                  router.push(ROUTES.CONTACT);
                }}
              >
                تواصل معنا
              </Button>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <PackageCheck className="h-8 w-8 text-slate-900" aria-hidden />
                <div>
                  <h3 className="font-display text-base font-bold text-slate-950">
                    الخطوة التالية
                  </h3>
                  <p className="text-sm text-slate-600">تابع حالة الطلب أو أكمل التسوق.</p>
                </div>
              </div>
              <div className="mt-4 grid gap-2">
                <Button
                  type="button"
                  size="lg"
                  className="font-bold"
                  onClick={() => {
                    onDismiss();
                    router.push(trackHref);
                  }}
                >
                  تتبع الطلب
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="border-slate-200 bg-white font-bold"
                  onClick={() => {
                    onDismiss();
                    router.push(ROUTES.MY_ORDERS);
                  }}
                >
                  طلباتي
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    onDismiss();
                    router.push(ROUTES.HOME);
                  }}
                >
                  متابعة التسوق
                </Button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
