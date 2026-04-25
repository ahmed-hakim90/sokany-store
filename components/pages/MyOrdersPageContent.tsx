"use client";

import { useQuery } from "@tanstack/react-query";
import { Link } from "next-view-transitions";
import { useState } from "react";
import { Package } from "lucide-react";
import { Container } from "@/components/Container";
import { PriceText } from "@/components/ui/price-text";
import { OrderDetailsModal } from "@/features/orders/components/order-details-modal";
import { fetchMyOrders } from "@/features/orders/services/fetchMyOrders";
import type { Order } from "@/features/orders/types";
import { wcStatusToTracking } from "@/features/order-tracking/wc-status-to-tracking";
import { ROUTES, STALE_TIME } from "@/lib/constants";
import { useAuthSession } from "@/hooks/useAuthSession";
import { cn } from "@/lib/utils";

/*
 * صفحة «طلباتي» (/my-orders): رأس لزق أعلى الشاشة على الجوال، ثم قائمة كروت داخل Container بعرض أقصى ضيق (max-w-2xl).
 * من md فما فوق: هوامش رأس أوضح، نفس الترتيب زمنياً (الأحدث أولاً من الـ API).
 * حالة فارغة: وسط الصفحة مع أيقونة وحزمة عروض تربط بصفحة المنتجات.
 * غير المسجّل: رسالة + روابط تسجيل الدخول والتتبع الضيف.
 */

function statusPresentation(order: Order): { label: string; className: string } {
  const { statusBadge } = wcStatusToTracking(order.status);
  const completed = order.status === "completed";
  return {
    label: statusBadge,
    className: completed
      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80"
      : "bg-sky-50 text-sky-800 ring-1 ring-sky-200/80",
  };
}

export function MyOrdersPageContent() {
  const { hasHydrated, isAuthenticated } = useAuthSession();
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const ordersQuery = useQuery({
    queryKey: ["my-orders"],
    queryFn: fetchMyOrders,
    enabled: hasHydrated && isAuthenticated,
    staleTime: STALE_TIME.MEDIUM,
  });

  const openDetails = (order: Order) => {
    setDetailOrder(order);
    setDetailOpen(true);
  };

  return (
    <div className="min-h-[60vh] bg-surface-muted/40 pb-24 pt-2 md:pb-16 md:pt-4">
      <div className="sticky top-0 z-10 border-b border-border/80 bg-white/95 px-4 py-4 shadow-sm backdrop-blur-md md:px-6">
        <Container className="max-w-2xl">
          <h1 className="font-display text-xl font-bold text-brand-950 md:text-2xl">طلباتي</h1>
          <p className="mt-1 text-sm text-brand-900/65">مشترياتك مرتبة من الأحدث إلى الأقدم.</p>
        </Container>
      </div>

      <Container className="max-w-2xl py-6">
        {!hasHydrated ? (
          <p className="rounded-xl border border-border bg-white px-4 py-3 text-sm text-brand-900/70">
            جاري التحميل…
          </p>
        ) : !isAuthenticated ? (
          <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
            <Package className="mx-auto h-12 w-12 text-brand-900/25" aria-hidden />
            <p className="mt-4 text-sm font-medium text-brand-950">سجّل الدخول لعرض طلباتك</p>
            <p className="mt-2 text-sm text-brand-900/65">
              أو استخدم{" "}
              <Link className="font-semibold text-brand-800 underline" href={ROUTES.ORDER_TRACKING}>
                تتبع الطلب
              </Link>{" "}
              برقم الطلب أو الموبايل دون حساب.
            </p>
            <Link
              href={ROUTES.LOGIN}
              className={cn(
                "mt-6 inline-flex h-12 items-center justify-center rounded-md bg-brand-500 px-8 text-base font-bold text-black shadow-sm transition-colors hover:bg-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900",
              )}
            >
              تسجيل الدخول
            </Link>
          </div>
        ) : ordersQuery.isLoading ? (
          <ul className="space-y-3">
            {[0, 1, 2].map((i) => (
              <li
                key={i}
                className="h-28 animate-pulse rounded-2xl border border-border/60 bg-white"
              />
            ))}
          </ul>
        ) : ordersQuery.isError ? (
          <p className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-900">
            تعذر تحميل الطلبات. حاول مرة أخرى لاحقاً.
          </p>
        ) : !ordersQuery.data?.length ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Package className="h-16 w-16 text-brand-900/15" aria-hidden />
            <p className="mt-4 text-base font-semibold text-brand-950">لم تقم بأي طلبات بعد</p>
            <p className="mt-2 max-w-sm text-sm text-brand-900/65">
              ابدأ من صفحة المنتجات واطلع على أحدث العروض والتصنيفات.
            </p>
            <Link
              href={ROUTES.PRODUCTS}
              className={cn(
                "mt-8 inline-flex h-12 items-center justify-center rounded-md bg-brand-500 px-10 text-base font-bold text-black shadow-sm transition-colors hover:bg-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900",
              )}
            >
              ابدأ التسوق الآن
            </Link>
            <Link
              href={ROUTES.HOME}
              className="mt-4 text-sm font-semibold text-brand-800 underline-offset-4 hover:underline"
            >
              العودة للرئيسية
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {ordersQuery.data.map((order) => {
              const dateLabel = new Date(order.dateCreated).toLocaleDateString("ar-EG", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });
              const st = statusPresentation(order);
              return (
                <li key={order.id}>
                  <div
                    className={cn(
                      "flex flex-col gap-4 rounded-2xl border border-border/80 bg-white p-4 shadow-sm transition-transform sm:flex-row sm:items-center sm:justify-between sm:p-5",
                      "active:scale-[0.99]",
                    )}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-muted/80 text-brand-900/70">
                        <Package className="h-6 w-6" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-display text-base font-bold text-brand-950">
                          طلب رقم #{order.id}
                        </h2>
                        <p className="mt-1 text-xs text-brand-900/50">{dateLabel}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
                      <PriceText amount={order.total} emphasized className="text-lg" />
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold",
                          st.className,
                        )}
                      >
                        {st.label}
                      </span>
                      <button
                        type="button"
                        className={cn(
                          "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-border bg-white px-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
                        )}
                        onClick={() => openDetails(order)}
                      >
                        تفاصيل
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Container>

      <OrderDetailsModal
        order={detailOrder}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setDetailOrder(null);
          }
        }}
      />
    </div>
  );
}
