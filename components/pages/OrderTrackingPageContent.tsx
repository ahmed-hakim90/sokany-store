"use client";

import { useQuery } from "@tanstack/react-query";
import { Link, useTransitionRouter } from "next-view-transitions";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Package } from "lucide-react";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { buildTrackingSteps } from "@/features/order-tracking/build-tracking-steps";
import { trackOrder } from "@/features/order-tracking/services/trackOrder";
import { ROUTES, STALE_TIME, WHATSAPP_SUPPORT_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

const TERMINAL_COPY: Record<string, string> = {
  cancelled: "تم إلغاء هذا الطلب.",
  refunded: "تم استرداد قيمة هذا الطلب.",
  failed: "تعذّر إتمام الطلب. تواصل مع الدعم إذا لزم الأمر.",
};

/*
 * صفحة تتبع الطلب (/track-order): بدون حقل إدخال — تُفتح عادة برابط ‎?q=‎ من بطاقة طلب أو شكر الشراء.
 * بدون ‎q‎: توجيه لطلباتي لاختيار طلب وعرض حالته.
 */
export function OrderTrackingPageContent() {
  const searchParams = useSearchParams();
  const router = useTransitionRouter();
  const qRaw = searchParams.get("q")?.trim() ?? "";

  const trackQuery = useQuery({
    queryKey: ["track-order", qRaw],
    queryFn: () => trackOrder(qRaw),
    enabled: qRaw.length >= 2,
    staleTime: STALE_TIME.SHORT,
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
    const baseTimeMs = Number.isFinite(base) ? base : Date.now();
    return buildTrackingSteps({
      activeIndex: data.currentStepIndex,
      allCompleted: data.allCompleted,
      baseTimeMs,
    });
  }, [showTimeline, data]);

  const displayOrderRef = data?.found === true ? String(data.orderId) : "";

  const showEmptyHint = qRaw.length < 2;

  return (
    <div className="flex min-h-[min(100dvh,1200px)] flex-col bg-page py-10 md:py-14">
      <Container className="mx-auto flex w-full max-w-md flex-1 flex-col items-stretch px-4">
        {showEmptyHint ? (
          <div className="w-full rounded-3xl border border-border/70 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/12">
              <Package className="h-8 w-8 text-brand-700" strokeWidth={2} aria-hidden />
            </div>
            <h1 className="font-display text-2xl font-bold text-brand-950">تتبع طلبك</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              اختر طلباً من قائمة «طلباتي» ثم اضغط «تتبع الطلب» لعرض حالة الشحن.
            </p>
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="mt-8 h-14 w-full rounded-2xl text-base font-bold shadow-[0_12px_32px_-18px_rgba(218,255,0,0.75)]"
              onClick={() => router.push(ROUTES.MY_ORDERS)}
            >
              الذهاب إلى طلباتي
            </Button>
            <Link
              href={ROUTES.HOME}
              className="mt-4 inline-block text-sm font-semibold text-brand-800 underline-offset-4 hover:underline"
            >
              العودة للرئيسية
            </Link>
          </div>
        ) : null}

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
          <div className="mt-8 w-full animate-slide-up rounded-3xl border border-border/70 bg-white p-8 text-start shadow-sm">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <p className="text-xs text-muted-foreground">رقم الطلب</p>
                <p dir="ltr" className="font-display text-lg font-bold text-brand-950">
                  {displayOrderRef || "—"}
                </p>
              </div>
              <div className="text-end">
                <p className="text-xs text-muted-foreground">الحالة</p>
                <span className="mt-1 inline-block rounded-full bg-brand-500/15 px-3 py-1 text-xs font-bold text-brand-900">
                  {data.statusBadge}
                </span>
              </div>
            </div>

            <ol className="relative space-y-0">
              {orderSteps.map((step, index) => {
                const isLast = index === orderSteps.length - 1;
                const segmentDone = allCompleted || index < activeIndex;
                return (
                  <li key={step.label} className="flex gap-4 pb-8 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                          step.status === "completed" &&
                            "bg-brand-500 text-black shadow-sm",
                          step.status === "current" &&
                            "border-2 border-brand-600 bg-white text-brand-700 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.35)]",
                          step.status === "pending" &&
                            "bg-surface-muted text-muted-foreground/50",
                        )}
                      >
                        {step.icon}
                      </div>
                      {!isLast ? (
                        <div
                          className={cn(
                            "h-10 w-0.5 shrink-0",
                            segmentDone ? "bg-brand-500" : "bg-border/80",
                          )}
                          aria-hidden
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p
                        className={cn(
                          "text-sm font-bold",
                          step.status === "pending"
                            ? "text-muted-foreground/45"
                            : "text-brand-950",
                        )}
                      >
                        {step.label}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{step.date}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-6 rounded-2xl border border-dashed border-border/80 bg-surface-muted/40 p-4">
              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                إذا واجهت أي مشكلة، لا تتردد في التواصل مع خدمة العملاء{" "}
                {WHATSAPP_SUPPORT_URL ? (
                  <a
                    href={WHATSAPP_SUPPORT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand-800 underline-offset-2 hover:underline"
                  >
                    عبر الواتساب
                  </a>
                ) : (
                  <span className="font-semibold text-brand-800">عبر الواتساب</span>
                )}{" "}
                الخاص بشركة المغربي.
              </p>
            </div>
          </div>
        ) : null}
      </Container>
    </div>
  );
}
