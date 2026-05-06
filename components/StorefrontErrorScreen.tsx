"use client";

import type { ReactNode } from "react";
import { Link } from "next-view-transitions";
import {
  AlertTriangle,
  Home,
  RefreshCw,
  Search,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/Button";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ErrorTone = "data" | "page" | "notFound" | "offline";

const iconByTone = {
  data: WifiOff,
  page: AlertTriangle,
  notFound: Search,
  offline: WifiOff,
} satisfies Record<ErrorTone, typeof AlertTriangle>;

const eyebrowByTone = {
  data: "مشكلة مؤقتة في التحميل",
  page: "حصل خطأ غير متوقع",
  notFound: "الصفحة غير موجودة",
  offline: "لا يوجد اتصال",
} satisfies Record<ErrorTone, string>;

export type StorefrontErrorScreenProps = {
  tone?: ErrorTone;
  title: string;
  description: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  referenceCode?: string;
  technicalDetails?: string;
  showTechnicalDetails?: boolean;
  compact?: boolean;
  className?: string;
};

export function StorefrontErrorScreen({
  tone = "data",
  title,
  description,
  primaryAction,
  secondaryAction,
  onRetry,
  retryLabel = "إعادة المحاولة",
  referenceCode,
  technicalDetails,
  showTechnicalDetails = false,
  compact = false,
  className,
}: StorefrontErrorScreenProps) {
  const Icon = iconByTone[tone];
  const safeTechnicalDetails = technicalDetails?.trim();

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-[2rem] border border-white/70 bg-white/78 text-center shadow-[0_24px_80px_-46px_rgba(15,23,42,0.45)] ring-1 ring-black/[0.04] backdrop-blur-xl",
        compact ? "px-5 py-8 sm:px-7 sm:py-10" : "px-5 py-12 sm:px-8 sm:py-16",
        className,
      )}
      role="alert"
    >
      <div
        className="pointer-events-none absolute inset-x-8 top-0 h-24 rounded-full bg-[radial-gradient(circle,rgba(218,255,0,0.32),transparent_68%)] blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-slate-200/70 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-300/80 bg-brand-50/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-brand-950">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          <span>{eyebrowByTone[tone]}</span>
        </div>

        <div className="mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-brand-950 text-accent shadow-[0_18px_36px_-20px_rgba(15,23,42,0.9)] ring-8 ring-white/80">
          <Icon className="h-8 w-8" strokeWidth={1.8} aria-hidden />
        </div>

        <h2 className="font-display text-2xl font-black tracking-tight text-brand-950 sm:text-3xl">
          {title}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-600 sm:text-base">
          {description}
        </p>

        {referenceCode ? (
          <p className="mt-4 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            كود مرجعي: <span dir="ltr">{referenceCode}</span>
          </p>
        ) : null}

        <div className="mt-7 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          {primaryAction ??
            (onRetry ? (
              <Button
                type="button"
                variant="primary"
                className="h-12 px-6 font-bold"
                onClick={onRetry}
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                {retryLabel}
              </Button>
            ) : null)}

          {secondaryAction ?? (
            <Link
              href={ROUTES.HOME}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border/80 bg-white px-6 text-sm font-bold text-brand-950 shadow-sm transition-colors hover:bg-surface-muted"
            >
              <Home className="h-4 w-4" aria-hidden />
              الرجوع للرئيسية
            </Link>
          )}
        </div>

        {showTechnicalDetails && safeTechnicalDetails ? (
          <details className="mt-6 w-full max-w-xl rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-start">
            <summary className="cursor-pointer text-sm font-bold text-slate-700">
              تفاصيل فنية للمطور
            </summary>
            <pre
              className="mt-3 max-h-44 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-slate-500"
              dir="ltr"
            >
              {safeTechnicalDetails}
            </pre>
          </details>
        ) : null}
      </div>
    </section>
  );
}
