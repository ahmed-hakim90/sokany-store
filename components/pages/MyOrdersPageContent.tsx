"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useTransitionRouter } from "next-view-transitions";
import { useEffect, useMemo, useState } from "react";
import {
  Filter,
  Home,
  ListOrdered,
  Package,
  ReceiptText,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Container } from "@/components/Container";
import { OrderDetailsModal } from "@/features/orders/components/order-details-modal";
import { OrderListCard } from "@/features/orders/components/order-list-card";
import { SelectField } from "@/components/ui/select-field";
import {
  clearCheckoutAmendSession,
  readCheckoutAmendSession,
  writeCheckoutAmendSession,
  writeCheckoutAmendFormPrefill,
} from "@/features/checkout/lib/checkout-amend-session";
import { orderToCheckoutFormData } from "@/features/checkout/lib/order-to-checkout-form";
import { fetchMyOrders } from "@/features/orders/services/fetchMyOrders";
import { cancelSessionOrder } from "@/features/orders/services/cancelSessionOrder";
import {
  cancelGuestOrder,
  fetchGuestOrdersBatch,
  type GuestBatchViewRow,
} from "@/features/orders/services/guestOrdersApi";
import { guestOrderActionEligibility } from "@/features/orders/lib/guest-order-server";
import type { Order, OrderStatus } from "@/features/orders/types";
import {
  listGuestOrderRefs,
  removeGuestOrderRef,
} from "@/features/orders/lib/local-guest-orders-storage";
import { orderItemsToCartItems } from "@/features/orders/lib/order-items-to-cart-items";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useCart } from "@/hooks/useCart";
import { GUEST_ORDER_AMEND_ENABLED, ROUTES, STALE_TIME, USE_MOCK } from "@/lib/constants";
import { StatWidget } from "@/components/ui/dashboard-widget";
import { cn, formatPrice } from "@/lib/utils";

/**
 * طلباتي — مسجّل + ضيف
 * بالعامية: JWT يجيب من `/api/orders`؛ الضيف يقرا refs من localStorage و batch view؛ فيه تعديل/إلغاء حسب السياسة و`USE_MOCK`.
 *
 * التفاصيل البصرية تحت.
 */
/*
 * صفحة «طلباتي» (/my-orders): طلبات الحساب (JWT) + طلبات محفوظة على الجهاز للضيف.
 * الموبايل: شريط ترحيب، بطاقات ملخص، فلترة ثم قائمة بطاقات عمودية.
 * من lg: عرض واسع مثل لوحة الحساب في المرجع؛ الملخصات 3 أعمدة وبطاقات الطلب تستغل العرض.
 *
 * — تحت عنوان الصفحة: إجمالي المبالغ + عدد الطلبات + فلترة الحالة/التاريخ؛
 *   كل الأرقام والقائمة تتبع نفس الفلتر حتى يقرأ العميل نفس السياق.
 */

type OrdersFilterStatus = "all" | "active" | "completed" | "cancelled";

const STATUS_FILTER_OPTIONS: Array<{ value: OrdersFilterStatus; label: string }> = [
  { value: "all", label: "كل الطلبات" },
  { value: "active", label: "طلبات جارية" },
  { value: "completed", label: "تم التسليم" },
  { value: "cancelled", label: "ملغاة أو فشلت" },
];

const ACTIVE_STATUSES: OrderStatus[] = ["pending", "processing", "on-hold"];
const CANCELLED_STATUSES: OrderStatus[] = ["cancelled", "refunded", "failed"];

function isGuestRowOk(row: GuestBatchViewRow): row is Extract<GuestBatchViewRow, { order: Order }> {
  return "order" in row && row.order != null;
}

function isGuestRowFailed(
  row: GuestBatchViewRow,
): row is { orderId: number; error: "forbidden" | "not_found" } {
  return "error" in row;
}

function orderMatchesStatus(order: Order, status: OrdersFilterStatus) {
  if (status === "all") return true;
  if (status === "active") return ACTIVE_STATUSES.includes(order.status);
  if (status === "completed") return order.status === "completed";
  return CANCELLED_STATUSES.includes(order.status);
}

function dayBoundary(value: string, endOfDay = false) {
  if (!value) return null;
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`);
  const time = date.getTime();
  return Number.isFinite(time) ? time : null;
}

function filterOrders(
  orders: Order[],
  status: OrdersFilterStatus,
  fromDate: string,
  toDate: string,
) {
  const from = dayBoundary(fromDate);
  const to = dayBoundary(toDate, true);

  return orders.filter((order) => {
    if (!orderMatchesStatus(order, status)) return false;
    const created = Date.parse(order.dateCreated);
    if (!Number.isFinite(created)) return true;
    if (from != null && created < from) return false;
    if (to != null && created > to) return false;
    return true;
  });
}

function formatShortDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function customerInitials(name?: string | null) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return "س";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

function OrdersFilterPanel({
  status,
  fromDate,
  toDate,
  onStatusChange,
  onFromDateChange,
  onToDateChange,
}: {
  status: OrdersFilterStatus;
  fromDate: string;
  toDate: string;
  onStatusChange: (value: OrdersFilterStatus) => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
}) {
  return (
    <section className="rounded-3xl border border-border/70 bg-white p-4 shadow-[0_18px_55px_-42px_rgba(15,23,42,0.45)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-brand-950">فلترة الطلبات</p>
          <p className="mt-1 text-xs text-muted-foreground">خصص القائمة حسب الحالة أو التاريخ.</p>
        </div>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-brand-900">
          <Filter className="h-5 w-5" aria-hidden />
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        <SelectField
          label="حالة الطلب"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as OrdersFilterStatus)}
        >
          {STATUS_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
        <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-brand-900">
          من تاريخ
          <input
            type="date"
            value={fromDate}
            onChange={(event) => onFromDateChange(event.target.value)}
            className="h-11 rounded-xl border border-border bg-white px-3 text-sm text-brand-950 shadow-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-brand-900">
          إلى تاريخ
          <input
            type="date"
            value={toDate}
            onChange={(event) => onToDateChange(event.target.value)}
            className="h-11 rounded-xl border border-border bg-white px-3 text-sm text-brand-950 shadow-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </label>
      </div>

      <p className="mt-4 rounded-2xl bg-surface-muted/70 px-3 py-2 text-xs leading-5 text-muted-foreground">
        يمكنك تصفية الطلبات حسب الحالة أو التاريخ؛ الملخصات والقائمة تتغير فوراً.
      </p>
    </section>
  );
}

export function MyOrdersPageContent() {
  const { hasHydrated, isAuthenticated, user } = useAuthSession();
  const queryClient = useQueryClient();
  const router = useTransitionRouter();
  const { replaceAllItems } = useCart();

  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCanAmend, setDetailCanAmend] = useState(false);
  const [detailCanCancel, setDetailCanCancel] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OrdersFilterStatus>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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

  const cancelSessionMutation = useMutation({
    mutationFn: (orderId: number) => cancelSessionOrder(orderId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-orders"] });
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
    const gmt = order.wooExcess?.date_created_gmt;
    const nowIso = new Date().toISOString();
    const actions = guestOrderActionEligibility({
      status: order.status,
      /* ‎USE_MOCK‎: تواريخ ‎mockOrders‎ قد تخرج من نافذة الساعتين — نطابق سلوك الـ API. */
      date_created: USE_MOCK ? nowIso : order.dateCreated,
      date_created_gmt: USE_MOCK
        ? nowIso
        : typeof gmt === "string"
          ? gmt
          : undefined,
    });
    setDetailCanCancel(actions.canCancel);
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
  const guestRowsOk = useMemo(
    () => (guestOrdersQuery.data ?? []).filter(isGuestRowOk),
    [guestOrdersQuery.data],
  );
  const guestRowsFailed = useMemo(
    () => (guestOrdersQuery.data ?? []).filter(isGuestRowFailed),
    [guestOrdersQuery.data],
  );

  const authList = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data]);
  const guestList = useMemo(() => guestRowsOk.map((row) => row.order), [guestRowsOk]);
  const sourceOrders = isAuthenticated ? authList : guestList;
  const filteredOrders = useMemo(
    () => filterOrders(sourceOrders, statusFilter, fromDate, toDate),
    [fromDate, sourceOrders, statusFilter, toDate],
  );
  const filteredTotal = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const latestFilteredOrder = filteredOrders[0];
  const hasLoadedOrders =
    hasHydrated &&
    (isAuthenticated
      ? !ordersQuery.isLoading && !ordersQuery.isError
      : !guestOrdersQuery.isLoading && !guestOrdersQuery.isError);
  const hasAnySourceOrders = sourceOrders.length > 0;
  const welcomeName = user?.displayName || user?.nicename || "العميل";

  const handleReorder = (order: Order) => {
    const cartItems = orderItemsToCartItems(order);
    if (cartItems.length === 0) {
      toast.error("لا توجد منتجات يمكن إضافتها إلى السلة.");
      return;
    }
    replaceAllItems(cartItems);
    toast.success("تمت إضافة منتجات الطلب إلى السلة", {
      description: `${cartItems.length} منتج جاهز للطلب`,
    });
    router.push(ROUTES.CART);
  };

  return (
    <div className="min-h-[60vh] bg-surface-muted/40 pb-24 pt-4 md:pb-16 md:pt-6">
      <Container className="mx-auto w-full max-w-7xl">
        {/* الرأس: عنوان الصفحة ومسار التنقل، ثم شريط الحساب/الضيف الذي يشبه مرجع لوحة الطلبات. */}
        <header className="mb-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-brand-950 md:text-3xl">
                طلباتي
              </h1>
              <nav
                aria-label="مسار التنقل"
                className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"
              >
                <Link href={ROUTES.HOME} className="hover:text-brand-900">
                  الصفحة الرئيسية
                </Link>
                <span aria-hidden>›</span>
                <span className="font-medium text-brand-950">طلباتي</span>
              </nav>
            </div>
            <Link
              href={ROUTES.MY_REVIEWS}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-semibold text-brand-950 shadow-sm transition-colors hover:bg-surface-muted"
            >
              تقييماتي
            </Link>
          </div>

          <div className="rounded-3xl border border-border/70 bg-white/95 p-4 shadow-[0_18px_55px_-42px_rgba(15,23,42,0.45)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-base font-bold text-brand-950 ring-1 ring-brand-200/70">
                  {isAuthenticated ? (
                    customerInitials(welcomeName)
                  ) : (
                    <UserRound className="h-5 w-5" aria-hidden />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-base font-bold text-brand-950">
                    {isAuthenticated ? `مرحباً، ${welcomeName}` : "هل لديك حساب؟"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isAuthenticated
                      ? "مشترياتك مرتبة من الأحدث إلى الأقدم."
                      : "تستطيع تتبع طلبات هذا الجهاز أو تسجيل الدخول لعرض كل الطلبات."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isAuthenticated ? (
                  <Link
                    href={ROUTES.LOGIN}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-semibold text-brand-950 transition-colors hover:bg-surface-muted"
                  >
                    تسجيل الدخول
                  </Link>
                ) : null}
                <Link
                  href={ROUTES.CART}
                  aria-label="السلة"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-950 text-white shadow-sm transition-colors hover:bg-brand-900"
                >
                  <ShoppingBag className="h-5 w-5" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* الملخص والفلترة: ثلاث بطاقات في الديسكتوب، وتتكدس على الموبايل كما في الصورة. */}
        {hasLoadedOrders && hasAnySourceOrders ? (
          <section className="mb-6 grid gap-4 lg:grid-cols-3">
            <StatWidget
              label="إجمالي المبالغ"
              value={formatPrice(filteredTotal)}
              hint={
                filteredOrders.length > 0
                  ? "إجمالي الطلبات المطابقة للفلاتر الحالية."
                  : "لا توجد طلبات مطابقة للفلاتر الحالية."
              }
              tone="brand"
              icon={ReceiptText}
            />
            <StatWidget
              label={isAuthenticated ? "إجمالي الطلبات" : "طلبات هذا الجهاز"}
              value={String(filteredOrders.length)}
              hint={
                latestFilteredOrder
                  ? `آخر طلب: رقم ${latestFilteredOrder.orderNumber || latestFilteredOrder.id} — ${formatShortDate(latestFilteredOrder.dateCreated)}`
                  : "غيّر الفلاتر لعرض طلبات أخرى."
              }
              tone="neutral"
              icon={ListOrdered}
            />
            <OrdersFilterPanel
              status={statusFilter}
              fromDate={fromDate}
              toDate={toDate}
              onStatusChange={setStatusFilter}
              onFromDateChange={setFromDate}
              onToDateChange={setToDate}
            />
          </section>
        ) : null}

        {/* القائمة الرئيسية: حالات التحميل/الفراغ ثم بطاقات الطلبات الغنية للمسجل أو الضيف. */}
        {!hasHydrated ? (
          <p className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-brand-900/70">
            جاري التحميل…
          </p>
        ) : !isAuthenticated ? (
          <>
            {guestOrdersQuery.isLoading ? (
              <ul className="space-y-3">
                {[0, 1].map((i) => (
                  <li
                    key={i}
                    className="h-44 animate-pulse rounded-3xl border border-border/60 bg-white"
                  />
                ))}
              </ul>
            ) : guestOrdersQuery.isError ? (
              <p className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-900">
                تعذر تحميل الطلبات المحفوظة. حاول مرة أخرى.
              </p>
            ) : guestData.length === 0 ? (
              <div className="rounded-3xl border border-border bg-white p-6 text-center shadow-sm">
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
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="font-display text-lg font-bold text-brand-950">
                    طلباتك من هذا الجهاز
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {filteredOrders.length} من {guestRowsOk.length}
                  </span>
                </div>
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
                {filteredOrders.length > 0 ? (
                  <ul className="space-y-4">
                    {filteredOrders.map((order) => {
                      const sourceRow = guestRowsOk.find((row) => row.order.id === order.id);
                      return (
                        <li key={order.id}>
                          <OrderListCard
                            order={order}
                            onDetailsClick={() =>
                              openGuestDetails(
                                order,
                                sourceRow?.canAmend ?? false,
                                sourceRow?.canCancel ?? false,
                              )
                            }
                            onReorderClick={() => handleReorder(order)}
                          />
                        </li>
                      );
                    })}
                  </ul>
                ) : hasAnySourceOrders ? (
                  <p className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-brand-900/75">
                    لا توجد طلبات تطابق الفلاتر الحالية.
                  </p>
                ) : guestRowsFailed.length === 0 ? (
                  <p className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-brand-900/75">
                    لم يُحمَّل أي طلب. إن كان لديك طلب على المتجر، استخدم التتبع أو{" "}
                    <Link className="font-semibold text-brand-800 underline" href={ROUTES.LOGIN}>
                      سجّل الدخول
                    </Link>
                    .
                  </p>
                ) : null}
                <div className="mt-8 rounded-3xl border border-border/70 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-muted text-brand-950">
                        <Home className="h-5 w-5" aria-hidden />
                      </span>
                      <div>
                        <p className="font-display text-base font-bold text-brand-950">
                          هل لديك حساب بدون تسجيل الدخول؟
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          يمكنك تتبع طلبك باستخدام رقم الطلب وبيانات التواصل.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      {/* <Link
                        href={ROUTES.ORDER_TRACKING}
                        className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-950 px-4 text-sm font-bold text-white transition-colors hover:bg-brand-900"
                      >
                        تتبع طلب بدون حساب
                      </Link> */}
                      <Link
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-semibold text-brand-950 transition-colors hover:bg-surface-muted"
                        href={ROUTES.LOGIN}
                      >
                        تسجيل الدخول
                      </Link>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-brand-900/70">
                    عند تسجيل الدخول ستظهر كل طلبات الحساب في مكان واحد.
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
                className="h-44 animate-pulse rounded-3xl border border-border/60 bg-white"
              />
            ))}
          </ul>
        ) : ordersQuery.isError ? (
          <p className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-900">
            تعذر تحميل الطلبات. حاول مرة أخرى لاحقاً.
          </p>
        ) : !ordersQuery.data?.length ? (
          <div className="flex flex-col items-center rounded-3xl border border-border bg-white px-6 py-16 text-center shadow-sm">
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
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-brand-950">طلباتك</h2>
              <span className="text-sm text-muted-foreground">
                {filteredOrders.length} من {authList.length}
              </span>
            </div>
            {filteredOrders.length > 0 ? (
              <ul className="space-y-4">
                {filteredOrders.map((order) => (
                  <li key={order.id}>
                    <OrderListCard
                      order={order}
                      onDetailsClick={() => openAuthDetails(order)}
                      onReorderClick={() => handleReorder(order)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-brand-900/75">
                لا توجد طلبات تطابق الفلاتر الحالية.
              </p>
            )}
          </>
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
                if (!window.confirm("هل تريد إلغاء هذا الطلب؟")) {
                  return;
                }
                if (isAuthenticated) {
                  cancelSessionMutation.mutate(detailOrder.id);
                  return;
                }
                if (!detailOrder.orderKey.trim()) {
                  return;
                }
                cancelGuestMutation.mutate({
                  orderId: detailOrder.id,
                  orderKey: detailOrder.orderKey,
                });
              }
            : undefined
        }
        cancelPending={cancelSessionMutation.isPending || cancelGuestMutation.isPending}
      />
    </div>
  );
}
