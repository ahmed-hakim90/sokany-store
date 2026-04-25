"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { Link } from "next-view-transitions";
import { useMemo } from "react";
import { AppImage } from "@/components/AppImage";
import { Container } from "@/components/Container";
import { fetchMyOrders } from "@/features/orders/services/fetchMyOrders";
import { getProductById } from "@/features/products/services/getProductById";
import { getReviews } from "@/features/reviews/services/getReviews";
import type { Order, OrderItem } from "@/features/orders/types";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useAuthSession } from "@/hooks/useAuthSession";
import { ROUTES, STALE_TIME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const PLACEHOLDER = "/images/placeholder.png";

/**
 * ‎/my-reviews‎: مسار عمود ‎`Container`‎ — للمسجّل فقط؛ منتجات من طلب ‎`completed`‎
 * لم تُنشر بها مراجعة ببريدك بعد، مع ارتباط بصفحة المنتج.
 */

function pdpIdFromItem(item: OrderItem): number {
  const v = item.variationId;
  if (v != null && v > 0) return v;
  return item.productId;
}

function uniquePdpIdsFromCompletedOrders(orders: Order[]): number[] {
  const seen = new Set<number>();
  for (const o of orders) {
    if (o.status !== "completed") continue;
    for (const it of o.items) {
      seen.add(pdpIdFromItem(it));
    }
  }
  return [...seen];
}

export function MyReviewsPageContent() {
  const { hasHydrated, isAuthenticated } = useAuthSession();
  const userEmail = useAuthStore((s) => s.user?.email) ?? "";
  const normalized = userEmail.trim().toLowerCase();

  const ordersQuery = useQuery({
    queryKey: ["my-orders", "for-reviews"],
    queryFn: fetchMyOrders,
    enabled: hasHydrated && isAuthenticated,
    staleTime: STALE_TIME.MEDIUM,
  });

  const pdpIds = useMemo(
    () =>
      !ordersQuery.data
        ? []
        : uniquePdpIdsFromCompletedOrders(ordersQuery.data),
    [ordersQuery.data],
  );

  const reviewChecks = useQueries({
    queries: pdpIds.map((id) => ({
      queryKey: ["reviews", "mine-check", id] as const,
      queryFn: () => getReviews(id),
      enabled: hasHydrated && isAuthenticated && pdpIds.length > 0 && Boolean(normalized),
      staleTime: STALE_TIME.SHORT,
    })),
  });

  const reviewPending = reviewChecks.some((c) => c.isPending);

  const pendingPdpIds = useMemo(() => {
    if (!pdpIds.length) return [];
    if (reviewPending) return [];
    return pdpIds.filter((id, i) => {
      const r = reviewChecks[i]?.data ?? [];
      return !r.some((x) => x.reviewerEmail.toLowerCase() === normalized);
    });
  }, [pdpIds, reviewPending, reviewChecks, normalized]);

  const productQueries = useQueries({
    queries: pendingPdpIds.map((id) => ({
      queryKey: ["product", "my-reviews", id] as const,
      queryFn: () => getProductById(id),
      enabled: !reviewPending && pendingPdpIds.length > 0,
      staleTime: STALE_TIME.MEDIUM,
      retry: (count: number, err: Error) => {
        if (count >= 1) return false;
        if (err && typeof err === "object" && "response" in err) {
          const s = (err as { response?: { status?: number } }).response?.status;
          if (s === 404) return false;
        }
        return true;
      },
    })),
  });

  const productPending = productQueries.some((c) => c.isPending);

  const rows = useMemo(() => {
    if (!pendingPdpIds.length) return [];
    return pendingPdpIds.map((pdp, i) => {
      const pq = productQueries[i];
      return {
        id: pdp,
        name: pq?.data?.name ?? `المنتج #${pdp}`,
        image: pq?.data?.thumbnail || pq?.data?.images[0]?.src || PLACEHOLDER,
        hasError: Boolean(pq?.isError),
        href: ROUTES.PRODUCT(pdp),
      };
    });
  }, [pendingPdpIds, productQueries]);

  if (!hasHydrated) {
    return (
      <Container className="py-10">
        <h1 className="font-display text-xl font-semibold text-brand-950 sm:text-2xl">
          تقييماتي
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
        <h1 className="font-display text-xl font-semibold text-brand-950 sm:text-2xl">
          تقييماتي
        </h1>
        <p className="mt-4 text-sm text-brand-900">
          سجّل الدخول لمعرفة المنتجات التي تستطيع تقييمها.
        </p>
        <Link
          className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-brand-500 px-6 text-sm font-bold text-black hover:bg-brand-400"
          href={ROUTES.LOGIN}
        >
          تسجيل الدخول
        </Link>
      </Container>
    );
  }

  if (ordersQuery.isPending) {
    return (
      <Container className="py-10">
        <h1 className="font-display text-xl font-semibold text-brand-950 sm:text-2xl">
          تقييماتي
        </h1>
        <p className="mt-4 text-sm text-zinc-600">جاري جلب طلباتك…</p>
      </Container>
    );
  }

  if (ordersQuery.isError) {
    return (
      <Container className="py-10">
        <h1 className="font-display text-xl font-semibold text-brand-950 sm:text-2xl">
          تقييماتي
        </h1>
        <p className="mt-4 text-sm text-red-800">تعذر تحميل طلباتك. حاول لاحقاً.</p>
      </Container>
    );
  }

  if (!pdpIds.length) {
    return (
      <Container className="py-10">
        <h1 className="font-display text-xl font-semibold text-brand-950 sm:text-2xl">
          تقييماتي
        </h1>
        <p className="mt-4 text-sm text-zinc-600">
          لا يوجد لديك طلب مكتمل يتضمّن منتجات. بعد اكتمال أول طلب لك، يظهر المنتج هنا للتقييم.
        </p>
        <Link
          className="mt-4 inline-block text-sm font-semibold text-brand-800 underline-offset-2 hover:underline"
          href={ROUTES.MY_ORDERS}
        >
          عرض طلباتي
        </Link>
      </Container>
    );
  }

  if (reviewPending) {
    return (
      <Container className="py-10">
        <h1 className="font-display text-xl font-semibold text-brand-950 sm:text-2xl">
          تقييماتي
        </h1>
        <p className="mt-4 text-sm text-zinc-600">جاري مزامنة التقييمات…</p>
      </Container>
    );
  }

  if (!rows.length) {
    return (
      <Container className="py-10">
        <h1 className="font-display text-xl font-semibold text-brand-950 sm:text-2xl">
          تقييماتي
        </h1>
        <p className="mt-4 text-sm text-zinc-600">
          أرسلتَ تقييماً لكل المنتجات المؤهّلة من طلباتك المكتملة. شكراً.
        </p>
        <Link
          className="mt-4 inline-block text-sm font-semibold text-brand-800 underline-offset-2 hover:underline"
          href={ROUTES.MY_ORDERS}
        >
          طلباتي
        </Link>
      </Container>
    );
  }

  if (productPending) {
    return (
      <Container className="py-10">
        <h1 className="font-display text-xl font-semibold text-brand-950 sm:text-2xl">
          تقييماتي
        </h1>
        <p className="mt-4 text-sm text-zinc-600">جاري تحميل تفاصيل المنتجات…</p>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <h1 className="font-display text-xl font-semibold text-brand-950 sm:text-2xl">
        تقييماتي
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600">
        اختر المنتج لانتقالك إلى صفحته. يُتاح نموذج التقييم فقط لمن أنهى طلباً مكتملاً
        ولم يضف تقييماً مسبقاً.
      </p>
      <ul className="mt-8 list-none space-y-4 p-0">
        {rows.map((row) => (
          <li
            key={row.id}
            className="rounded-xl border border-border bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex flex-col gap-4 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-muted">
                  <AppImage
                    src={row.image}
                    alt=""
                    width={80}
                    height={80}
                    className="size-full object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="min-w-0">
                  <p
                    className="font-medium text-brand-950 line-clamp-2"
                    title={row.name}
                  >
                    {row.name}
                    {row.hasError ? (
                      <span className="whitespace-nowrap text-sm font-normal text-amber-800">
                        {" "}
                        — بيانات المنتج ربما اختُزنت من ووكومرس
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
              <Link
                className={cn(
                  "inline-flex h-11 w-full min-w-0 max-w-sm shrink-0 items-center justify-center rounded-lg bg-brand-500 px-5",
                  "text-sm font-bold text-black transition-colors hover:bg-brand-400",
                  "min-[400px]:w-auto",
                )}
                href={row.href}
              >
                الانتقال وإكمال التقييم
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </Container>
  );
}
