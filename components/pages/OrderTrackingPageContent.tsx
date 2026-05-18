"use client";

import { useQuery } from "@tanstack/react-query";
import { Link, useTransitionRouter } from "next-view-transitions";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CalendarClock,
  ClipboardList,
  ExternalLink,
  Headphones,
  MapPinned,
  Package,
  ReceiptText,
  RotateCcw,
  ShoppingBag,
  Truck,
} from "lucide-react";
import type { CartItem } from "@/features/cart/types";
import { AppImage } from "@/components/AppImage";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import {
  buildTrackingSteps,
  HorizontalTrackingTimeline,
} from "@/features/order-tracking/build-tracking-steps";
import { trackOrder } from "@/features/order-tracking/services/trackOrder";
import { ProductCarouselRow } from "@/features/products/components/product-carousel-row";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { SearchField } from "@/components/ui/search-field";
import { ROUTES, STALE_TIME, WHATSAPP_SUPPORT_URL } from "@/lib/constants";
import { surfacePanelClass } from "@/lib/storefront-surfaces";
import { cn, formatPrice } from "@/lib/utils";

/**
 * تتبع الطلب في العميل
 * بالعامية: `?q=` من رابط الشكر؛ من غيره بنحوّل لطلباتي. الـ query بتعمل polling كل دقيقة لحد ما الطلب يخلص حالة نهائية.
 *
 * التفاصيل البصرية تحت.
 */
const TERMINAL_COPY: Record<string, string> = {
  cancelled: "تم إلغاء هذا الطلب.",
  refunded: "تم استرداد قيمة هذا الطلب.",
  failed: "تعذّر إتمام الطلب. تواصل مع الدعم إذا لزم الأمر.",
};

/*
 * صفحة تتبع الطلب (/track-order): على الموبايل تظهر كبطاقات متتالية تبدأ بالحالة
 * والخط الزمني ثم تفاصيل الشحنة والمنتجات والملخص. من lg تتحول إلى grid بعمود
 * رئيسي للتتبع وعمود جانبي ثابت لملخص الطلب والعنوان وشركة الشحن والفاتورة.
 */

function formatOrderDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildMapsHref(shipping: {
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
}) {
  const query = [
    shipping.address1,
    shipping.address2,
    shipping.city,
    shipping.state,
    shipping.postcode,
  ]
    .filter(Boolean)
    .join("، ");
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : "";
}

function CardTitle({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="font-display text-base font-bold text-brand-950">{children}</h2>
      <span className="text-brand-900/70">{icon}</span>
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

export function OrderTrackingPageContent() {
  const searchParams = useSearchParams();
  const router = useTransitionRouter();
  const qRaw = searchParams.get("q")?.trim() ?? "";
  const orderKeyRaw = searchParams.get("k")?.trim() ?? "";
  const [lookupInput, setLookupInput] = useState(qRaw);
  const { getCartLineQuantity, setProductLineQuantity, replaceAllItems } = useCart();

  const submitLookup = useCallback(() => {
    const next = lookupInput.trim();
    if (next.length < 2) return;
    router.push(`${ROUTES.ORDER_TRACKING}?q=${encodeURIComponent(next)}`);
  }, [lookupInput, router]);

  const trackQuery = useQuery({
    queryKey: ["track-order", qRaw, orderKeyRaw],
    queryFn: () => trackOrder(qRaw, orderKeyRaw),
    enabled: qRaw.length >= 2,
    staleTime: STALE_TIME.MEDIUM,
    refetchInterval: (query) => {
      const value = query.state.data;
      return value?.found === true && value.terminal == null ? 60_000 : false;
    },
    refetchIntervalInBackground: false,
    retry: 1,
  });

  const data = trackQuery.data;
  const showTimeline =
    trackQuery.isSuccess && data?.found === true && data.terminal == null;
  const showTerminal =
    trackQuery.isSuccess && data?.found === true && data.terminal != null;
  const showNotFound = trackQuery.isSuccess && data?.found === false;
  const showError = trackQuery.isError;

  const activeIndex = data?.found === true ? data.currentStepIndex : 0;
  const allCompleted = data?.found === true ? data.allCompleted : false;

  const orderSteps = useMemo(() => {
    if (!showTimeline || !data?.found) return [];
    const base = Date.parse(data.dateCreated);
    const baseTimeMs = Number.isFinite(base) ? base : trackQuery.dataUpdatedAt;
    return buildTrackingSteps({
      activeIndex: data.currentStepIndex,
      allCompleted: data.allCompleted,
      baseTimeMs,
    });
  }, [showTimeline, data, trackQuery.dataUpdatedAt]);

  const recommendations = useProducts(
    { orderby: "popularity", order: "desc", per_page: 6 },
    { enabled: showTimeline },
  );

  const displayOrderRef =
    data?.found === true ? data.orderNumber || String(data.orderId) : "";
  const orderDateLabel = data?.found === true ? formatOrderDate(data.dateCreated) : "—";
  const mapsHref = data?.found === true && data.shipping ? buildMapsHref(data.shipping) : "";
  const carouselStatus = recommendations.isPending
    ? "loading"
    : recommendations.data?.items.length
      ? "ready"
      : "empty";

  const handleReorder = useCallback(() => {
    if (!data?.found || !data.items?.length) return;
    const cartItems: CartItem[] = data.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      thumbnail: item.image,
      sku: "",
    }));
    replaceAllItems(cartItems);
    toast.success("تمت إضافة المنتجات إلى السلة", {
      description: `${cartItems.length} منتج جاهز للطلب`,
    });
    router.push(ROUTES.CART);
  }, [data, replaceAllItems, router]);

  const showEmptyHint = qRaw.length < 2;

  useEffect(() => {
    setLookupInput(qRaw);
  }, [qRaw]);

  return (
    <div className="flex min-h-[min(100dvh,1200px)] flex-col bg-page py-6 md:py-8">
      <Container
        className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-stretch px-4"
      >
        <section
          className={cn(
            surfacePanelClass,
            "mb-5 w-full p-4 sm:p-5",
            showTimeline ? "max-w-7xl" : "max-w-md",
          )}
        >
          <h1 className="font-display text-xl font-bold text-brand-950 sm:text-2xl">
            تتبع طلبك
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            أدخل رقم الطلب من رسالة التأكيد أو من صفحة طلباتي.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <SearchField
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
              placeholder="رقم الطلب…"
              aria-label="رقم الطلب للتتبع"
              className="min-w-0 flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitLookup();
                }
              }}
            />
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="h-11 shrink-0 font-bold sm:px-8"
              onClick={submitLookup}
              disabled={lookupInput.trim().length < 2}
            >
              بحث
            </Button>
          </div>
          {showEmptyHint ? (
            <div className="mt-6 space-y-3 border-t border-border/60 pt-5 text-center">
              <p className="text-sm text-muted-foreground">
                أو اختر طلباً من قائمة «طلباتي» ثم اضغط «تتبع الطلب».
              </p>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="h-12 w-full"
                onClick={() => router.push(ROUTES.MY_ORDERS)}
              >
                الذهاب إلى طلباتي
              </Button>
              <Link
                href={ROUTES.HOME}
                className="inline-block text-sm font-semibold text-brand-800 underline-offset-4 hover:underline"
              >
                العودة للرئيسية
              </Link>
            </div>
          ) : null}
        </section>

        {showEmptyHint ? null : (
          <div className="mx-auto mb-4 flex w-full max-w-7xl justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-brand-800"
              onClick={() => router.push(ROUTES.MY_ORDERS)}
            >
              طلباتي
            </Button>
          </div>
        )}

        {!showEmptyHint && trackQuery.isPending ? (
          <div className="w-full rounded-3xl border border-border/70 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-medium text-brand-950">جاري جلب حالة الطلب…</p>
          </div>
        ) : null}

        {showError ? (
          <div
            className="mt-8 w-full rounded-3xl border border-red-200 bg-red-50/90 px-4 py-4 text-center text-sm text-red-900"
            role="alert"
          >
            حدث خطأ أثناء البحث. حاول مرة أخرى بعد قليل.
          </div>
        ) : null}

        {showNotFound ? (
          <div className="mt-8 w-full rounded-3xl border border-border/70 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-semibold text-brand-950">لم نعثر على طلب مطابق</p>
            <p className="mt-2 text-xs text-muted-foreground">
              راجع رقم الطلب من صفحة «طلباتي» أو تواصل مع الدعم.
            </p>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="mt-6 h-12 w-full"
              onClick={() => router.push(ROUTES.MY_ORDERS)}
            >
              طلباتي
            </Button>
          </div>
        ) : null}

        {showTerminal && data?.found ? (
          <div className="mt-8 w-full animate-slide-up rounded-3xl border border-border/70 bg-white p-8 text-center shadow-sm">
            <p className="text-xs text-muted-foreground">رقم الطلب</p>
            <p dir="ltr" className="font-display text-lg font-bold text-brand-950">
              {data.orderId}
            </p>
            <p className="mt-4 text-sm font-medium text-brand-900">
              {data.terminal
                ? (TERMINAL_COPY[data.terminal] ??
                    "لا يمكن عرض مسار الشحن لهذا الطلب.")
                : null}
            </p>
          </div>
        ) : null}

        {showTimeline && data?.found ? (
          <div className="w-full animate-slide-up space-y-4 md:space-y-5">
            {/* الرأس والخط الزمني: بطاقة كاملة العرض على كل المقاسات مع خط أفقي بخمس مراحل. */}
            <section className="rounded-3xl border border-border/70 bg-white p-4 text-start shadow-sm sm:p-6">
              <div className="mb-6 flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    <Truck className="h-4 w-4" aria-hidden />
                    {data.statusBadge}
                  </p>
                  <h1 className="mt-3 font-display text-2xl font-bold text-brand-950 sm:text-3xl">
                    تتبع الطلب
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    تابع حالة الشحن لحظة بلحظة من استلام الطلب حتى التسليم.
                  </p>
                </div>
                <div className="rounded-2xl bg-page/70 px-4 py-3 text-start sm:text-end">
                  <p className="text-xs text-muted-foreground">رقم الطلب</p>
                  <p dir="ltr" className="font-display text-lg font-bold text-brand-950">
                    #{displayOrderRef || "—"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{orderDateLabel}</p>
                </div>
              </div>
              <HorizontalTrackingTimeline
                steps={orderSteps}
                activeIndex={activeIndex}
                allCompleted={allCompleted}
              />
            </section>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
              {/* العمود الرئيسي: حالة الوصول، خريطة مختصرة، أحداث الشحنة، ومنتجات الطلب. */}
              <main className="space-y-4">
                <section className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-sm sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                        <CalendarClock className="h-5 w-5" aria-hidden />
                      </span>
                      <div>
                        <h2 className="font-display text-lg font-bold text-brand-950">
                          {allCompleted ? "تم توصيل طلبك" : "طلبك في طريقه إليك"}
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-brand-900/75">
                          {allCompleted
                            ? "تم تسليم الشحنة بنجاح. نتمنى أن تكون التجربة مرضية."
                            : "التوصيل المتوقع خلال يوم إلى ثلاثة أيام عمل من تاريخ تأكيد الطلب."}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                      آخر تحديث الآن
                    </span>
                  </div>
                </section>

                <section className="rounded-2xl border border-border/70 bg-white p-4 shadow-sm sm:p-5">
                  <CardTitle icon={<Truck className="h-5 w-5" aria-hidden />}>
                    تفاصيل الشحنة
                  </CardTitle>
                  <ol className="space-y-0">
                    {orderSteps.map((step, index) => {
                      const isLast = index === orderSteps.length - 1;
                      return (
                        <li key={step.label} className="flex gap-3 pb-5 last:pb-0">
                          <div className="flex flex-col items-center">
                            <span
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full border",
                                step.status === "completed" &&
                                  "border-emerald-500 bg-emerald-500 text-white",
                                step.status === "current" &&
                                  "border-emerald-600 bg-white text-emerald-700",
                                step.status === "pending" &&
                                  "border-border bg-surface-muted text-muted-foreground/55",
                              )}
                            >
                              {step.icon}
                            </span>
                            {!isLast ? (
                              <span
                                className={cn(
                                  "h-8 w-px",
                                  step.status === "completed" ? "bg-emerald-500" : "bg-border",
                                )}
                                aria-hidden
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0 pt-0.5">
                            <p className="text-sm font-bold text-brand-950">{step.label}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{step.date}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </section>

                <section className="rounded-2xl border border-border/70 bg-white p-4 shadow-sm sm:p-5">
                  <CardTitle icon={<ShoppingBag className="h-5 w-5" aria-hidden />}>
                    منتجات الطلب ({data.items?.length ?? 0})
                  </CardTitle>
                  {data.items?.length ? (
                    <ul className="divide-y divide-border/60">
                      {data.items.map((item) => (
                        <li
                          key={`${item.productId}-${item.name}`}
                          className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] gap-3 py-3 first:pt-0 last:pb-0"
                        >
                          <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-border bg-image-well">
                            <AppImage src={item.image} alt="" fill sizes="64px" />
                            <span className="absolute end-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-950 px-1 text-[10px] font-bold text-white">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="min-w-0 self-center">
                            <p className="line-clamp-2 text-sm font-bold text-brand-950">
                              {item.name}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              الكمية: {item.quantity}
                            </p>
                          </div>
                          <p
                            className="self-center text-sm font-bold tabular-nums text-brand-950"
                            dir="ltr"
                          >
                            {formatPrice(item.total)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="rounded-xl bg-page/60 p-4 text-sm text-muted-foreground">
                      لم تصل تفاصيل المنتجات مع حالة التتبع حالياً.
                    </p>
                  )}
                  {data.items?.length ? (
                    <Button
                      type="button"
                      variant="secondary"
                      className="mt-4 w-full gap-2"
                      onClick={handleReorder}
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden />
                      إعادة طلب نفس المنتجات
                    </Button>
                  ) : null}
                </section>
              </main>

              {/* الشريط الجانبي: ملخص الطلب والعنوان وشركة الشحن والفاتورة؛ يثبت من lg. */}
              <aside className="space-y-4 lg:sticky lg:top-6">
                <section className="rounded-2xl border border-border/70 bg-white p-5 shadow-sm">
                  <CardTitle icon={<ClipboardList className="h-5 w-5" aria-hidden />}>
                    ملخص الطلب
                  </CardTitle>
                  <div className="space-y-3 text-sm">
                    <SummaryRow label="رقم الطلب" value={`#${displayOrderRef}`} />
                    <SummaryRow label="حالة الطلب" value={data.statusBadge} />
                    <SummaryRow
                      label="طريقة الدفع"
                      value={data.paymentMethodTitle || "غير محددة"}
                    />
                    <SummaryRow label="تاريخ الطلب" value={orderDateLabel} />
                  </div>
                </section>

                {data.shipping ? (
                  <section className="rounded-2xl border border-border/70 bg-white p-5 shadow-sm">
                    <CardTitle icon={<MapPinned className="h-5 w-5" aria-hidden />}>
                      عنوان الشحن
                    </CardTitle>
                    <div className="space-y-1.5 text-sm leading-6 text-brand-900/85">
                      <p className="font-bold text-brand-950">{data.shipping.name || "العميل"}</p>
                      {data.shipping.phone ? <p dir="ltr">{data.shipping.phone}</p> : null}
                      <p>
                        {[
                          data.shipping.address1,
                          data.shipping.address2,
                          data.shipping.city,
                          data.shipping.state,
                          data.shipping.postcode,
                        ]
                          .filter(Boolean)
                          .join("، ")}
                      </p>
                    </div>
                    {mapsHref ? (
                      <a
                        href={mapsHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-white text-sm font-semibold text-brand-950 transition-colors hover:bg-surface-muted"
                      >
                        عرض على الخريطة
                        <ExternalLink className="h-4 w-4" aria-hidden />
                      </a>
                    ) : null}
                  </section>
                ) : null}

                {data.carrier ? (
                  <section className="rounded-2xl border border-border/70 bg-white p-5 shadow-sm">
                    <CardTitle icon={<Truck className="h-5 w-5" aria-hidden />}>
                      شركة الشحن
                    </CardTitle>
                    <div className="space-y-2 text-sm text-brand-900/80">
                      <p className="font-bold text-brand-950">{data.carrier.name}</p>
                      {data.carrier.trackingNumber ? (
                        <p>
                          رقم التتبع{" "}
                          <span dir="ltr" className="font-semibold tabular-nums">
                            {data.carrier.trackingNumber}
                          </span>
                        </p>
                      ) : null}
                    </div>
                    {data.carrier.trackingUrl ? (
                      <a
                        href={data.carrier.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-white text-sm font-semibold text-brand-950 transition-colors hover:bg-surface-muted"
                      >
                        تتبع عبر شركة الشحن
                        <ExternalLink className="h-4 w-4" aria-hidden />
                      </a>
                    ) : null}
                  </section>
                ) : null}

                <section className="rounded-2xl border border-border/70 bg-white p-5 shadow-sm">
                  <CardTitle icon={<ReceiptText className="h-5 w-5" aria-hidden />}>
                    ملخص الفاتورة
                  </CardTitle>
                  <div className="space-y-3">
                    <SummaryRow label="المجموع الفرعي" value={formatPrice(data.subtotal)} />
                    <SummaryRow
                      label="تكلفة الشحن"
                      value={data.shippingTotal > 0 ? formatPrice(data.shippingTotal) : "مجاني"}
                      tone="success"
                    />
                    {data.discount > 0 ? (
                      <SummaryRow
                        label="خصم"
                        value={`- ${formatPrice(data.discount)}`}
                        tone="discount"
                      />
                    ) : null}
                    <div className="border-t border-border pt-3">
                      <SummaryRow label="الإجمالي" value={formatPrice(data.total)} strong />
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-border/70 bg-white p-5 text-center shadow-sm">
                  <Headphones className="mx-auto h-8 w-8 text-brand-950" aria-hidden />
                  <h2 className="mt-3 font-display text-base font-bold text-brand-950">
                    تحتاج مساعدة؟
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    فريق الدعم متاح لمتابعة طلبك أو تعديل بيانات التواصل.
                  </p>
                  {WHATSAPP_SUPPORT_URL ? (
                    <a
                      href={WHATSAPP_SUPPORT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-brand-950 px-4 text-sm font-bold text-white transition-colors hover:bg-brand-900"
                    >
                      تواصل مع الدعم
                    </a>
                  ) : (
                    <Button
                      type="button"
                      variant="dark"
                      className="mt-4 w-full"
                      onClick={() => router.push(ROUTES.CONTACT)}
                    >
                      تواصل معنا
                    </Button>
                  )}
                </section>
              </aside>
            </div>

            {/* توصيات بعد التتبع: صف أفقي يبقى أسفل الصفحة على الموبايل والديسكتوب. */}
            <section className="rounded-2xl border border-border/70 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-brand-950">
                    منتجات قد تعجبك
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    اختيارات سريعة تكمل طلبك الحالي.
                  </p>
                </div>
                <RotateCcw className="hidden h-6 w-6 text-muted-foreground sm:block" aria-hidden />
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
        ) : null}
      </Container>
    </div>
  );
}
