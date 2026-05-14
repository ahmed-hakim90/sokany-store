"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { Link } from "next-view-transitions";
import { useMemo } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  MessageCircle,
  PackageCheck,
  ShoppingBag,
  Star,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppImage } from "@/components/AppImage";
import { Container } from "@/components/Container";
import { StatWidget } from "@/components/ui/dashboard-widget";
import { fetchMyOrders } from "@/features/orders/services/fetchMyOrders";
import { getProductById } from "@/features/products/services/getProductById";
import { getReviews } from "@/features/reviews/services/getReviews";
import type { Order, OrderItem } from "@/features/orders/types";
import { useAuthSession } from "@/hooks/useAuthSession";
import { ROUTES, STALE_TIME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const PLACEHOLDER = "/images/placeholder.png";

/**
 * تقييماتي (مسجّل)
 * بالعامية: بنستخرج منتجات من أوردرات `completed`، نجيب تفاصيل المنتج والمراجعات، ونعرض اللي لسه ما اتكتبش فيه ريفيو بنفس الإيميل.
 *
 * شوف كمان: `@/lib/review-purchase-eligibility.ts`
 */
/*
 * صفحة «تقييماتي» (/my-reviews): لوحة حساب خفيفة للمنتجات المؤهّلة للتقييم من الطلبات المكتملة.
 * الموبايل: رأس ومسار تنقّل، بطاقة ترحيب/دعوة، ثم حالات التحميل أو بطاقات المنتجات عمودياً.
 * من lg: نفس عرض لوحة «طلباتي»؛ الملخصات 3 أعمدة وبطاقات المنتجات أوسع مع CTA جانبي.
 *
 * — الرأس ثابت عبر الحالات حتى لا يتغيّر موضع الصفحة؛ المحتوى فقط يتبدل بين دعوة تسجيل الدخول،
 *   التحميل، الفراغ، أو قائمة المنتجات التي لم تُقيّم بعد.
 */

type PendingReviewRow = {
  id: number;
  name: string;
  image: string;
  hasError: boolean;
  href: string;
};

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

function customerInitials(name?: string | null) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return "س";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

function PageShell({
  children,
  welcomeName,
  showWelcome,
}: {
  children: React.ReactNode;
  welcomeName: string;
  showWelcome: boolean;
}) {
  return (
    <div className="min-h-[60vh] bg-surface-muted/40 pb-24 pt-4 md:pb-16 md:pt-6">
      <Container className="mx-auto w-full max-w-7xl">
        {/* الرأس: عنوان الصفحة ومسار التنقل مع رابط عكسي إلى «طلباتي». */}
        <header className="mb-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-brand-950 md:text-3xl">
                تقييماتي
              </h1>
              <nav
                aria-label="مسار التنقل"
                className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"
              >
                <Link href={ROUTES.HOME} className="hover:text-brand-900">
                  الصفحة الرئيسية
                </Link>
                <span aria-hidden>›</span>
                <span className="font-medium text-brand-950">تقييماتي</span>
              </nav>
            </div>
            <Link
              href={ROUTES.MY_ORDERS}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-semibold text-brand-950 shadow-sm transition-colors hover:bg-surface-muted"
            >
              طلباتي
            </Link>
          </div>

          {showWelcome ? (
            <div className="rounded-3xl border border-border/70 bg-white/95 p-4 shadow-[0_18px_55px_-42px_rgba(15,23,42,0.45)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-base font-bold text-brand-950 ring-1 ring-brand-200/70">
                    {customerInitials(welcomeName)}
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-base font-bold text-brand-950">
                      مرحباً، {welcomeName}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      المنتجات المؤهّلة للتقييم تظهر هنا بعد اكتمال الطلب.
                    </p>
                  </div>
                </div>

                <Link
                  href={ROUTES.CART}
                  aria-label="السلة"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-950 text-white shadow-sm transition-colors hover:bg-brand-900"
                >
                  <ShoppingBag className="h-5 w-5" aria-hidden />
                </Link>
              </div>
            </div>
          ) : null}
        </header>

        {children}
      </Container>
    </div>
  );
}

function LoginPromptCard() {
  return (
    <section className="rounded-3xl border border-border bg-white p-6 text-center shadow-sm">
      <UserRound className="mx-auto h-12 w-12 text-brand-900/25" aria-hidden />
      <h2 className="mt-4 font-display text-lg font-bold text-brand-950">
        سجّل الدخول لعرض تقييماتك
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-brand-900/65">
        سنعرض لك المنتجات من طلباتك المكتملة التي تستطيع إضافة تقييم لها.
      </p>
      <Link
        className="mt-6 inline-flex h-12 items-center justify-center rounded-md bg-brand-500 px-8 text-base font-bold text-black shadow-sm transition-colors hover:bg-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900"
        href={ROUTES.LOGIN}
      >
        تسجيل الدخول
      </Link>
    </section>
  );
}

function LoadingList({ label }: { label: string }) {
  return (
    <section aria-label={label} aria-busy>
      <ul className="space-y-3">
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="h-36 animate-pulse rounded-3xl border border-border/60 bg-white sm:h-32"
          />
        ))}
      </ul>
    </section>
  );
}

function StatusCard({
  title,
  description,
  tone = "neutral",
}: {
  title: string;
  description: string;
  tone?: "neutral" | "destructive";
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border bg-white px-4 py-3 text-sm shadow-sm",
        tone === "destructive"
          ? "border-red-200 bg-red-50/80 text-red-900"
          : "border-border text-brand-900/75",
      )}
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-1 leading-6">{description}</p>
    </section>
  );
}

function EmptyStateCard({
  title,
  description,
  cta,
  icon: Icon,
}: {
  title: string;
  description: string;
  cta: React.ReactNode;
  icon: LucideIcon;
}) {
  return (
    <section className="rounded-3xl border border-border bg-white p-6 text-center shadow-sm">
      <Icon className="mx-auto h-12 w-12 text-brand-900/25" aria-hidden />
      <h2 className="mt-4 font-display text-lg font-bold text-brand-950">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-brand-900/65">
        {description}
      </p>
      <div className="mt-6">{cta}</div>
    </section>
  );
}

function PendingReviewProductCard({ row }: { row: PendingReviewRow }) {
  return (
    <li className="rounded-3xl border border-border/70 bg-white p-4 shadow-[0_18px_55px_-42px_rgba(15,23,42,0.45)] transition-transform active:scale-[0.99] sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface-muted">
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
            <p className="text-xs font-medium text-muted-foreground">
              منتج بانتظار تقييمك
            </p>
            <h2
              className="mt-1 font-display text-lg font-bold text-brand-950 line-clamp-2"
              title={row.name}
            >
              {row.name}
            </h2>
            {row.hasError ? (
              <p className="mt-2 text-xs leading-5 text-amber-800">
                بيانات المنتج ربما اختُزنت من ووكومرس، ويمكنك إكمال التقييم من صفحة المنتج.
              </p>
            ) : (
              <p className="mt-2 text-xs leading-5 text-brand-900/55">
                افتح صفحة المنتج وستجد نموذج التقييم متاحاً لك.
              </p>
            )}
          </div>
        </div>

        <Link
          className={cn(
            "inline-flex h-11 w-full min-w-0 shrink-0 items-center justify-center rounded-xl bg-brand-500 px-5",
            "text-sm font-bold text-black shadow-sm transition-colors hover:bg-brand-400",
            "lg:w-auto",
          )}
          href={row.href}
        >
          الانتقال وإكمال التقييم
        </Link>
      </div>
    </li>
  );
}

export function MyReviewsPageContent() {
  const { hasHydrated, isAuthenticated, user } = useAuthSession();
  const normalized = user?.email?.trim().toLowerCase() ?? "";
  const welcomeName = user?.displayName || user?.nicename || "العميل";

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

  const rows = useMemo<PendingReviewRow[]>(() => {
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

  const reviewedCount = reviewPending
    ? 0
    : Math.max(pdpIds.length - pendingPdpIds.length, 0);
  const shellProps = {
    welcomeName,
    showWelcome: hasHydrated && isAuthenticated,
  };

  if (!hasHydrated) {
    return (
      <PageShell {...shellProps}>
        <LoadingList label="جاري تحميل صفحة تقييماتي" />
      </PageShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageShell {...shellProps}>
        <LoginPromptCard />
      </PageShell>
    );
  }

  if (ordersQuery.isPending) {
    return (
      <PageShell {...shellProps}>
        <LoadingList label="جاري جلب طلباتك المؤهلة للتقييم" />
      </PageShell>
    );
  }

  if (ordersQuery.isError) {
    return (
      <PageShell {...shellProps}>
        <StatusCard
          title="تعذر تحميل طلباتك"
          description="حاول تحديث الصفحة لاحقاً، أو ارجع إلى صفحة طلباتي للتأكد من حالة الطلبات."
          tone="destructive"
        />
      </PageShell>
    );
  }

  if (!pdpIds.length) {
    return (
      <PageShell {...shellProps}>
        <EmptyStateCard
          icon={PackageCheck}
          title="لا توجد منتجات مؤهّلة بعد"
          description="لا يوجد لديك طلب مكتمل يتضمّن منتجات. بعد اكتمال أول طلب لك، يظهر المنتج هنا للتقييم."
          cta={
            <Link
              href={ROUTES.MY_ORDERS}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-white px-5 text-sm font-semibold text-brand-950 shadow-sm transition-colors hover:bg-surface-muted"
            >
              عرض طلباتي
            </Link>
          }
        />
      </PageShell>
    );
  }

  if (reviewPending) {
    return (
      <PageShell {...shellProps}>
        {/* الملخص: يظهر قبل القائمة بعد معرفة المنتجات المكتملة، مع عدادات قيد المزامنة. */}
        <section className="mb-6 grid gap-4 lg:grid-cols-3">
          <StatWidget
            label="منتجات مؤهّلة"
            value={String(pdpIds.length)}
            hint="منتجات من طلباتك المكتملة."
            tone="brand"
            icon={ClipboardCheck}
          />
          <StatWidget
            label="بانتظار تقييمك"
            value="…"
            hint="نراجع تقييماتك الحالية الآن."
            tone="warning"
            icon={Star}
          />
          <StatWidget
            label="تم تقييمها"
            value="…"
            hint="سيظهر العدد بعد انتهاء المزامنة."
            tone="neutral"
            icon={CheckCircle2}
          />
        </section>
        <LoadingList label="جاري مزامنة التقييمات" />
      </PageShell>
    );
  }

  if (!rows.length) {
    return (
      <PageShell {...shellProps}>
        <section className="mb-6 grid gap-4 lg:grid-cols-3">
          <StatWidget
            label="منتجات مؤهّلة"
            value={String(pdpIds.length)}
            hint="منتجات من طلباتك المكتملة."
            tone="brand"
            icon={ClipboardCheck}
          />
          <StatWidget
            label="بانتظار تقييمك"
            value="0"
            hint="لا يوجد منتج يحتاج إلى تقييم حالياً."
            tone="success"
            icon={Star}
          />
          <StatWidget
            label="تم تقييمها"
            value={String(reviewedCount)}
            hint="شكراً لمشاركة رأيك مع باقي العملاء."
            tone="neutral"
            icon={CheckCircle2}
          />
        </section>
        <EmptyStateCard
          icon={MessageCircle}
          title="كل المنتجات المؤهّلة مقيّمة"
          description="أرسلتَ تقييماً لكل المنتجات المؤهّلة من طلباتك المكتملة. شكراً لمساعدتك باقي العملاء."
          cta={
            <Link
              href={ROUTES.MY_ORDERS}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-white px-5 text-sm font-semibold text-brand-950 shadow-sm transition-colors hover:bg-surface-muted"
            >
              طلباتي
            </Link>
          }
        />
      </PageShell>
    );
  }

  if (productPending) {
    return (
      <PageShell {...shellProps}>
        <section className="mb-6 grid gap-4 lg:grid-cols-3">
          <StatWidget
            label="منتجات مؤهّلة"
            value={String(pdpIds.length)}
            hint="منتجات من طلباتك المكتملة."
            tone="brand"
            icon={ClipboardCheck}
          />
          <StatWidget
            label="بانتظار تقييمك"
            value={String(pendingPdpIds.length)}
            hint="منتجات سنعرض تفاصيلها بعد التحميل."
            tone="warning"
            icon={Star}
          />
          <StatWidget
            label="تم تقييمها"
            value={String(reviewedCount)}
            hint="منتجات أضفت تقييمك عليها سابقاً."
            tone="neutral"
            icon={CheckCircle2}
          />
        </section>
        <LoadingList label="جاري تحميل تفاصيل المنتجات" />
      </PageShell>
    );
  }

  return (
    <PageShell {...shellProps}>
      {/* الملخص والقائمة: نفس وزن لوحة «طلباتي» مع 3 عدادات ثم بطاقات منتجات. */}
      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        <StatWidget
          label="منتجات مؤهّلة"
          value={String(pdpIds.length)}
          hint="منتجات من طلباتك المكتملة."
          tone="brand"
          icon={ClipboardCheck}
        />
        <StatWidget
          label="بانتظار تقييمك"
          value={String(rows.length)}
          hint="اختر المنتج واكتب تقييمك من صفحته."
          tone="warning"
          icon={Star}
        />
        <StatWidget
          label="تم تقييمها"
          value={String(reviewedCount)}
          hint="منتجات أضفت تقييمك عليها سابقاً."
          tone="neutral"
          icon={CheckCircle2}
        />
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-brand-950">
              منتجات تنتظر تقييمك
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              اختر المنتج لانتقالك إلى صفحته. يُتاح نموذج التقييم فقط لمن أنهى طلباً مكتملاً
              ولم يضف تقييماً مسبقاً.
            </p>
          </div>
          <span className="text-sm text-muted-foreground">
            {rows.length} من {pdpIds.length}
          </span>
        </div>

        <ul className="list-none space-y-4 p-0">
          {rows.map((row) => (
            <PendingReviewProductCard key={row.id} row={row} />
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
