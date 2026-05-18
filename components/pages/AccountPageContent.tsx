"use client";

import { useQuery } from "@tanstack/react-query";
import { Link } from "next-view-transitions";
import { useState } from "react";
import {
  Heart,
  MapPin,
  Package,
  Star,
  UserRound,
} from "lucide-react";
import { Container } from "@/components/Container";
import { OrderDetailsModal } from "@/features/orders/components/order-details-modal";
import { OrderListCard } from "@/features/orders/components/order-list-card";
import { fetchMyOrders } from "@/features/orders/services/fetchMyOrders";
import type { Order } from "@/features/orders/types";
import { useAuthSession } from "@/hooks/useAuthSession";
import { ROUTES, STALE_TIME } from "@/lib/constants";
import {
  surfaceEmptyStateClass,
  surfacePageHeroClass,
  surfacePanelClass,
} from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";

const ACCOUNT_ORDERS_PREVIEW = 5;

const DASHBOARD_LINKS = [
  {
    href: ROUTES.MY_ORDERS,
    title: "طلباتي",
    description: "تتبع الطلبات والفواتير",
    icon: Package,
  },
  {
    href: ROUTES.WISHLIST,
    title: "المفضلة",
    description: "المنتجات المحفوظة",
    icon: Heart,
  },
  {
    href: ROUTES.ORDER_TRACKING,
    title: "تتبع طلب",
    description: "ابحث برقم الطلب",
    icon: MapPin,
  },
  {
    href: ROUTES.MY_REVIEWS,
    title: "تقييماتي",
    description: "قيّم مشترياتك",
    icon: Star,
  },
  {
    href: ROUTES.CONTACT,
    title: "الدعم",
    description: "تواصل مع خدمة العملاء",
    icon: UserRound,
  },
] as const;

/*
 * صفحة الحساب (/account):
 * — الجوال: بطاقات اختصار ثم معاينة الطلبات عمودياً.
 * — من lg: شبكة 3 أعمدة للاختصارات؛ قائمة طلبات بعرض أوسع.
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
        <header className={surfacePageHeroClass}>
          <h1 className="font-display text-xl font-semibold text-brand-950 sm:text-2xl md:text-3xl">
            الحساب
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            سجّل الدخول لمتابعة طلباتك ومفضلتك.
          </p>
        </header>
        <div className={cn(surfacePanelClass, "mt-6 p-6 text-center")}>
          <p className="text-sm text-brand-900">
            يلزم تسجيل الدخول لعرض بيانات حسابك وطلباتك.
          </p>
          <Link
            href={ROUTES.LOGIN}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-brand-500 px-6 text-sm font-bold text-black hover:bg-brand-400"
          >
            تسجيل الدخول
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-10">
      <header className={surfacePageHeroClass}>
        <h1 className="font-display text-xl font-semibold text-brand-950 sm:text-2xl md:text-3xl">
          الحساب
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          اختصارات سريعة لطلباتك ومفضلتك والدعم.
        </p>
      </header>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DASHBOARD_LINKS.map(({ href, title, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              surfacePanelClass,
              "flex min-h-[5.5rem] items-start gap-3 p-4 transition-shadow hover:shadow-md",
            )}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-900">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-base font-bold text-brand-950">
                {title}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-brand-950">آخر الطلبات</h2>
            <p className="mt-1 text-sm text-zinc-600">معاينة سريعة — التفاصيل الكاملة في طلباتي.</p>
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
          <div className={cn(surfaceEmptyStateClass, "mt-6 flex flex-col items-center")}>
            <Package className="h-14 w-14 text-brand-900/15" aria-hidden />
            <p className="mt-3 text-sm font-medium text-brand-950">لا توجد طلبات بعد</p>
            <Link
              href={ROUTES.PRODUCTS}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-brand-500 px-6 text-sm font-bold text-black hover:bg-brand-400"
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

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className={cn(surfacePanelClass, "p-5")}>
          <h2 className="font-display text-lg font-semibold text-brand-950">الملف الشخصي</h2>
          <p className="mt-2 text-sm text-muted-foreground">تعديل البيانات قيد الإعداد.</p>
          <p className="mt-3 rounded-xl border border-dashed border-border/80 bg-surface-muted/30 px-3 py-2 text-xs text-brand-900/70">
            الاسم والبريد والهاتف ستظهر هنا عند تفعيل التعديل.
          </p>
        </div>
        <div className={cn(surfacePanelClass, "p-5")}>
          <h2 className="font-display text-lg font-semibold text-brand-950">العناوين</h2>
          <p className="mt-2 text-sm text-muted-foreground">دفتر العناوين قيد الإعداد.</p>
          <p className="mt-3 rounded-xl border border-dashed border-border/80 bg-surface-muted/30 px-3 py-2 text-xs text-brand-900/70">
            عناوين الشحن المحفوظة ستُدار من هنا لاحقاً.
          </p>
        </div>
      </section>

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
