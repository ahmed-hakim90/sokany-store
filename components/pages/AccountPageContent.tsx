"use client";

import { useQuery } from "@tanstack/react-query";
import { Link } from "next-view-transitions";
import { useState } from "react";
import { Package } from "lucide-react";
import { Container } from "@/components/Container";
import { OrderDetailsModal } from "@/features/orders/components/order-details-modal";
import { OrderListCard } from "@/features/orders/components/order-list-card";
import { fetchMyOrders } from "@/features/orders/services/fetchMyOrders";
import type { Order } from "@/features/orders/types";
import { useAuthSession } from "@/hooks/useAuthSession";
import { ROUTES, STALE_TIME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ACCOUNT_ORDERS_PREVIEW = 5;

/*
 * صفحة الحساب (/account):
 * - عمود رئيسي داخل Container؛ زائر: عنوان + دعوة لتسجيل الدخول.
 * - مسجّل: عنوان، قسم «طلباتي» (معاينة حتى 5 طلبات + رابط كل الطلبات)، ثم شبكة 3 أعمدة من md: تقييمات / ملف / عناوين.
 * - الجوال: نفس الترتيب عمودياً؛ مودال تفاصيل الطلب مطابق لصفحة طلباتي.
 */
export function AccountPageContent() {
  const { hasHydrated, isAuthenticated } = useAuthSession();
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const ordersQuery = useQuery({
    queryKey: ["my-orders"],
    queryFn: fetchMyOrders,
    enabled: hasHydrated && isAuthenticated,
    staleTime: STALE_TIME.MEDIUM,
  });

  const previewOrders = ordersQuery.data?.slice(0, ACCOUNT_ORDERS_PREVIEW) ?? [];
  const totalOrders = ordersQuery.data?.length ?? 0;
  const hasMoreOrders = totalOrders > ACCOUNT_ORDERS_PREVIEW;

  if (!hasHydrated) {
    return (
      <Container className="py-10">
        <h1 className="font-display text-xl font-semibold text-brand-950 sm:text-2xl md:text-3xl">
          الحساب
        </h1>
        <p className="mt-4 rounded-xl border border-border bg-surface-muted/30 px-4 py-3 text-sm text-brand-900">
          جاري التحميل…
        </p>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container className="py-10">
        <h1 className="font-display text-xl font-semibold text-brand-950 sm:text-2xl md:text-3xl">
          الحساب
        </h1>
        <p className="mt-4 rounded-xl border border-border bg-surface-muted/30 px-4 py-3 text-sm text-brand-900">
          يلزم تسجيل الدخول لعرض بيانات حسابك وطلباتك.
        </p>
        <Link
          href={ROUTES.LOGIN}
          className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-brand-500 px-6 text-sm font-bold text-black hover:bg-brand-400"
        >
          تسجيل الدخول
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <h1 className="font-display text-xl font-semibold text-brand-950 sm:text-2xl md:text-3xl">
        الحساب
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        إدارة ملفك الشخصي وعناوينك ستُربط لاحقاً بووكومرس.
      </p>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-brand-950">طلباتي</h2>
            <p className="mt-1 text-sm text-zinc-600">
              آخر الطلبات. لعرض القائمة كاملة انتقل إلى صفحة الطلبات.
            </p>
          </div>
          <Link
            href={ROUTES.MY_ORDERS}
            className="text-sm font-semibold text-brand-800 underline-offset-4 hover:underline"
          >
            كل الطلبات
          </Link>
        </div>

        {ordersQuery.isLoading ? (
          <ul className="mt-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <li
                key={i}
                className="h-28 animate-pulse rounded-2xl border border-border/60 bg-white"
              />
            ))}
          </ul>
        ) : ordersQuery.isError ? (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-900">
            تعذر تحميل الطلبات.{" "}
            <Link href={ROUTES.MY_ORDERS} className="font-semibold underline">
              حاول من صفحة طلباتي
            </Link>
            .
          </p>
        ) : previewOrders.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-border bg-white py-12 text-center">
            <Package className="h-14 w-14 text-brand-900/15" aria-hidden />
            <p className="mt-3 text-sm font-medium text-brand-950">لا توجد طلبات بعد</p>
            <Link
              href={ROUTES.PRODUCTS}
              className={cn(
                "mt-4 inline-flex h-10 items-center justify-center rounded-md bg-brand-500 px-6 text-sm font-bold text-black hover:bg-brand-400",
              )}
            >
              تسوق الآن
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-6 space-y-4">
              {previewOrders.map((order) => (
                <li key={order.id}>
                  <OrderListCard
                    order={order}
                    onDetailsClick={() => {
                      setDetailOrder(order);
                      setDetailOpen(true);
                    }}
                  />
                </li>
              ))}
            </ul>
            {hasMoreOrders ? (
              <Link
                href={ROUTES.MY_ORDERS}
                className="mt-4 inline-flex text-sm font-semibold text-brand-800 underline-offset-4 hover:underline"
              >
                عرض كل الطلبات ({totalOrders})
              </Link>
            ) : null}
          </>
        )}
      </section>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <section className="rounded-lg border border-brand-100 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold">تقييماتي</h2>
          <p className="mt-2 text-sm text-zinc-600">
            المنتجات من طلباتك المكتملة التي يمكنك إضافة تقييم لها.
          </p>
          <Link
            href={ROUTES.MY_REVIEWS}
            className="mt-4 inline-flex text-sm font-semibold text-brand-800 underline-offset-4 hover:underline"
          >
            فتح تقييماتي
          </Link>
        </section>
        <section className="rounded-lg border border-brand-100 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold">الملف الشخصي</h2>
          <p className="mt-2 text-sm text-zinc-600">تعديل البيانات قيد الإعداد.</p>
        </section>
        <section className="rounded-lg border border-brand-100 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold">العناوين</h2>
          <p className="mt-2 text-sm text-zinc-600">دفتر العناوين قيد الإعداد.</p>
        </section>
      </div>

      <OrderDetailsModal
        order={detailOrder}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setDetailOrder(null);
        }}
      />
    </Container>
  );
}
