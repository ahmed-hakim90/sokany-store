"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useTransitionRouter } from "next-view-transitions";
import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { toast } from "sonner";
import { Container } from "@/components/Container";
import { OrderDetailsModal } from "@/features/orders/components/order-details-modal";
import { OrderListCard } from "@/features/orders/components/order-list-card";
import {
  clearCheckoutAmendSession,
  readCheckoutAmendSession,
  writeCheckoutAmendSession,
  writeCheckoutAmendFormPrefill,
} from "@/features/checkout/lib/checkout-amend-session";
import { orderToCheckoutFormData } from "@/features/checkout/lib/order-to-checkout-form";
import { fetchMyOrders } from "@/features/orders/services/fetchMyOrders";
import {
  cancelGuestOrder,
  fetchGuestOrdersBatch,
  type GuestBatchViewRow,
} from "@/features/orders/services/guestOrdersApi";
import type { Order } from "@/features/orders/types";
import {
  listGuestOrderRefs,
  removeGuestOrderRef,
} from "@/features/orders/lib/local-guest-orders-storage";
import { orderItemsToCartItems } from "@/features/orders/lib/order-items-to-cart-items";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useCart } from "@/hooks/useCart";
import { GUEST_ORDER_AMEND_ENABLED, ROUTES, STALE_TIME } from "@/lib/constants";
import { cn } from "@/lib/utils";

/*
 * صفحة «طلباتي» (/my-orders): طلبات الحساب (JWT) + طلبات محفوظة على الجهاز للضيف.
 * من md فما فوق: هوامش رأس أوضح، نفس الترتيب زمنياً.
 */

function isGuestRowOk(row: GuestBatchViewRow): row is Extract<GuestBatchViewRow, { order: Order }> {
  return "order" in row && row.order != null;
}

function isGuestRowFailed(
  row: GuestBatchViewRow,
): row is { orderId: number; error: "forbidden" | "not_found" } {
  return "error" in row;
}

export function MyOrdersPageContent() {
  const { hasHydrated, isAuthenticated } = useAuthSession();
  const queryClient = useQueryClient();
  const router = useTransitionRouter();
  const { replaceAllItems } = useCart();

  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCanAmend, setDetailCanAmend] = useState(false);
  const [detailCanCancel, setDetailCanCancel] = useState(false);

  const ordersQuery = useQuery({
    queryKey: ["my-orders"],
    queryFn: fetchMyOrders,
    enabled: hasHydrated && isAuthenticated,
    staleTime: STALE_TIME.MEDIUM,
  });

  const guestOrdersQuery = useQuery({
    queryKey: ["guest-device-orders"],
    queryFn: async () => {
      const refs = listGuestOrderRefs();
      if (refs.length === 0) return [];
      return fetchGuestOrdersBatch(refs);
    },
    enabled: hasHydrated && !isAuthenticated,
    staleTime: STALE_TIME.SHORT,
  });

  /* لا نحذف المرجع عند ‎forbidden‎ — غالباً مفتاح قديم أو تعارض مؤقت؛ يبقى ظاهراً مع رسالة. نزيل فقط ‎not_found‎. */
  useEffect(() => {
    const rows = guestOrdersQuery.data;
    if (!rows?.length) return;
    let removed = false;
    for (const row of rows) {
      if (isGuestRowFailed(row) && row.error === "not_found") {
        removeGuestOrderRef(row.orderId);
        removed = true;
      }
    }
    if (removed) {
      void queryClient.invalidateQueries({ queryKey: ["guest-device-orders"] });
    }
  }, [guestOrdersQuery.data, queryClient]);

  const cancelGuestMutation = useMutation({
    mutationFn: ({ orderId, orderKey }: { orderId: number; orderKey: string }) =>
      cancelGuestOrder(orderId, orderKey),
    onSuccess: async (_, v) => {
      const amend = readCheckoutAmendSession();
      if (amend?.orderId === v.orderId) {
        clearCheckoutAmendSession();
      }
      /* نُبقي مرجع الطلب في ‎localStorage‎ — يظهر في «طلباتي» كـ «ملغى» بعد التحديث من ووكومرس */
      await queryClient.invalidateQueries({ queryKey: ["guest-device-orders"] });
      toast.success("تم إلغاء الطلب.");
      setDetailOpen(false);
      setDetailOrder(null);
      setDetailCanAmend(false);
      setDetailCanCancel(false);
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "تعذر إلغاء الطلب.");
    },
  });

  const openGuestDetails = (order: Order, canAmend: boolean, canCancel: boolean) => {
    setDetailOrder(order);
    setDetailCanAmend(canAmend);
    setDetailCanCancel(canCancel);
    setDetailOpen(true);
  };

  const openAuthDetails = (order: Order) => {
    setDetailOrder(order);
    setDetailCanAmend(false);
    setDetailCanCancel(false);
    setDetailOpen(true);
  };

  const startAmend = (order: Order) => {
    if (!GUEST_ORDER_AMEND_ENABLED) {
      toast.error("تعديل الطلب غير متاح حالياً.");
      return;
    }
    if (!order.orderKey.trim()) {
      toast.error("تعذر تعديل هذا الطلب.");
      return;
    }
    const amendSession = { orderId: order.id, orderKey: order.orderKey };
    writeCheckoutAmendSession(amendSession);
    writeCheckoutAmendFormPrefill(amendSession, orderToCheckoutFormData(order));
    replaceAllItems(orderItemsToCartItems(order));
    router.push(ROUTES.CHECKOUT);
  };

  const guestData = guestOrdersQuery.data ?? [];
  const guestRowsOk = guestData.filter(isGuestRowOk);
  const guestRowsFailed = guestData.filter(isGuestRowFailed);

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
          <>
            {guestOrdersQuery.isLoading ? (
              <ul className="space-y-3">
                {[0, 1].map((i) => (
                  <li
                    key={i}
                    className="h-28 animate-pulse rounded-2xl border border-border/60 bg-white"
                  />
                ))}
              </ul>
            ) : guestOrdersQuery.isError ? (
              <p className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-900">
                تعذر تحميل الطلبات المحفوظة. حاول مرة أخرى.
              </p>
            ) : guestData.length === 0 ? (
              <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm">
                <Package className="mx-auto h-12 w-12 text-brand-900/25" aria-hidden />
                <p className="mt-4 text-sm font-medium text-brand-950">لا توجد طلبات على هذا الجهاز بعد</p>
                <p className="mt-2 text-sm text-brand-900/65">
                  بعد إتمام أي طلب يُحفظ هنا تلقائياً لمدة محدودة. يمكنك أيضاً{" "}
                  <Link className="font-semibold text-brand-800 underline" href={ROUTES.LOGIN}>
                    تسجيل الدخول
                  </Link>{" "}
                  لمزامنة طلباتك مع الحساب.
                </p>
                <Link
                  href={ROUTES.PRODUCTS}
                  className={cn(
                    "mt-6 inline-flex h-12 items-center justify-center rounded-md bg-brand-500 px-8 text-base font-bold text-black shadow-sm transition-colors hover:bg-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900",
                  )}
                >
                  تسوق الآن
                </Link>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm font-medium text-brand-900/80">طلبات من هذا الجهاز</p>
                {guestRowsFailed.length > 0 ? (
                  <ul className="mb-4 space-y-3">
                    {guestRowsFailed.map((row) => (
                      <li key={row.orderId}>
                        <div className="rounded-2xl border border-amber-200/90 bg-amber-50/90 p-4 text-sm text-brand-950">
                          <p className="font-semibold">طلب #{row.orderId}</p>
                          <p className="mt-2 text-brand-900/80">
                            {row.error === "not_found"
                              ? "الطلب غير موجود على المتجر."
                              : "تعذّر جلب تفاصيل الطلب من الجهاز (مفتاح الطلب قد يكون غير متزامن). جرّب التتبع برقم الطلب أو أزل السجل لإعادة المحاولة بعد طلب جديد."}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Link
                              href={`${ROUTES.ORDER_TRACKING}?q=${encodeURIComponent(String(row.orderId))}`}
                              className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-white px-3 text-sm font-semibold text-foreground hover:bg-surface-muted"
                            >
                              تتبع الطلب
                            </Link>
                            <button
                              type="button"
                              className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-white px-3 text-sm font-semibold text-red-800 hover:bg-red-50"
                              onClick={() => {
                                removeGuestOrderRef(row.orderId);
                                void queryClient.invalidateQueries({
                                  queryKey: ["guest-device-orders"],
                                });
                              }}
                            >
                              إزالة من هذا الجهاز
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {guestRowsOk.length > 0 ? (
                  <ul className="space-y-4">
                    {guestRowsOk.map((row) => (
                      <li key={row.order.id}>
                        <OrderListCard
                          order={row.order}
                          onDetailsClick={() =>
                            openGuestDetails(row.order, row.canAmend, row.canCancel)
                          }
                        />
                      </li>
                    ))}
                  </ul>
                ) : guestRowsFailed.length === 0 ? (
                  <p className="rounded-xl border border-border bg-white px-4 py-3 text-sm text-brand-900/75">
                    لم يُحمَّل أي طلب. إن كان لديك طلب على المتجر، استخدم التتبع أو{" "}
                    <Link className="font-semibold text-brand-800 underline" href={ROUTES.LOGIN}>
                      سجّل الدخول
                    </Link>
                    .
                  </p>
                ) : null}
                <div className="mt-8 rounded-2xl border border-dashed border-border/80 bg-white/60 p-4 text-center">
                  <p className="text-sm text-brand-900/70">
                    هل لديك حساب؟{" "}
                    <Link className="font-semibold text-brand-800 underline" href={ROUTES.LOGIN}>
                      سجّل الدخول
                    </Link>{" "}
                    لعرض كل طلباتك.
                  </p>
                </div>
              </>
            )}
          </>
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
            {ordersQuery.data.map((order) => (
              <li key={order.id}>
                <OrderListCard order={order} onDetailsClick={() => openAuthDetails(order)} />
              </li>
            ))}
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
            setDetailCanAmend(false);
            setDetailCanCancel(false);
          }
        }}
        canAmend={detailCanAmend}
        canCancel={detailCanCancel}
        onAmend={detailOrder ? () => startAmend(detailOrder) : undefined}
        onCancel={
          detailOrder && detailCanCancel
            ? () => {
                if (
                  !detailOrder.orderKey.trim() ||
                  !window.confirm("هل تريد إلغاء هذا الطلب؟")
                ) {
                  return;
                }
                cancelGuestMutation.mutate({
                  orderId: detailOrder.id,
                  orderKey: detailOrder.orderKey,
                });
              }
            : undefined
        }
        cancelPending={cancelGuestMutation.isPending}
      />
    </div>
  );
}
