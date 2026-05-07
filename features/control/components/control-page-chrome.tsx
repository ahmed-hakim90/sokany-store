"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2, CircleDashed, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tone = "brand" | "emerald" | "amber" | "rose" | "slate";

/**
 * غلاف منطقة المحتوى الأساسية في صفحات /control الفرعية (max-w + spacing).
 * كل من /control/dev و/control/woo-api كانت تكرر نفس الـwrapper يدويًا.
 */
export function ControlPageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full min-w-0 max-w-5xl px-4 py-6 sm:px-5 sm:py-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * رأس صفحة موحّد: eyebrow + h1 + description + actions.
 * يُستخدم في ControlPanel/CommandCenter/WooApiDashboard ليُعطي ثبات بصري واحد.
 */
export function ControlPageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
  compact = false,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  /** عنصر إضافي قبل الأزرار (مثل شارة حالة). */
  meta?: React.ReactNode;
  /** نسخة مدمجة تستعمل داخل header بار `/control` (نفس البلاغة بحجم أصغر). */
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-start sm:justify-between",
        compact ? "gap-3" : "gap-4",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {eyebrow}
        </p>
        <h1
          className={cn(
            "font-display font-bold tracking-tight text-slate-900",
            compact ? "text-2xl" : "text-2xl sm:text-3xl",
          )}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={cn(
              "mt-1 text-sm text-slate-600",
              compact ? undefined : "max-w-2xl",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {actions || meta ? (
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {meta}
          {actions}
        </div>
      ) : null}
    </div>
  );
}

/**
 * كرت "كود + زر نسخ" — كان مكرر 4 مرات بـ useState/timeout خاص لكل مرة.
 */
export function CopyableCode({
  value,
  label,
  description,
  className,
  buttonClassName,
}: {
  value: string;
  /** نص الزر الافتراضي (قبل النسخ). */
  label?: string;
  description?: string;
  className?: string;
  buttonClassName?: string;
}) {
  const [copied, setCopied] = useCopyState();
  const buttonLabel = label ?? "نسخ الرابط";
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {description ? (
          <p className="text-xs font-medium text-slate-900">{description}</p>
        ) : null}
        <code
          className="ltr mt-1 block min-w-0 break-all rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-800"
          dir="ltr"
        >
          {value}
        </code>
      </div>
      <Button
        type="button"
        variant="secondary"
        className={cn(
          "shrink-0 border-slate-200 bg-white text-sm shadow-sm",
          buttonClassName,
        )}
        onClick={() => {
          void navigator.clipboard.writeText(value);
          setCopied();
        }}
      >
        {copied ? "تم النسخ" : buttonLabel}
      </Button>
    </div>
  );
}

function useCopyState(timeoutMs = 1500) {
  const [copied, setCopiedState] = useState(false);
  const setCopied = () => {
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), timeoutMs);
  };
  return [copied, setCopied] as const;
}

/**
 * نمط loading/error/empty للـpanels — كان متكرر بنفس النص ("جاري التحميل…")
 * في 4 مواضع. غير ذلك المكوّن ينقل المسؤولية إلى children.
 */
export function ControlAsyncState({
  loading,
  error,
  empty,
  loadingLabel = "جاري التحميل…",
  emptyLabel,
  onRetry,
  retryLabel = "إعادة المحاولة",
  children,
}: {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  loadingLabel?: string;
  emptyLabel?: string;
  onRetry?: () => void;
  retryLabel?: string;
  children?: React.ReactNode;
}) {
  if (loading) {
    return <p className="text-sm text-slate-500">{loadingLabel}</p>;
  }
  if (error) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-sm text-amber-950">
        {error}
        {onRetry ? (
          <div className="mt-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={onRetry}
              className="border-slate-200 bg-white text-xs"
            >
              {retryLabel}
            </Button>
          </div>
        ) : null}
      </div>
    );
  }
  if (empty) {
    return <p className="text-sm text-slate-500">{emptyLabel ?? "لا توجد بيانات."}</p>;
  }
  return <>{children}</>;
}

const toneClasses: Record<Tone, string> = {
  brand: "border-brand-200/80 bg-brand-50/70 text-brand-950",
  emerald: "border-emerald-200/80 bg-emerald-50/80 text-emerald-950",
  amber: "border-amber-200/80 bg-amber-50/80 text-amber-950",
  rose: "border-rose-200/80 bg-rose-50/80 text-rose-950",
  slate: "border-slate-200/80 bg-slate-50/80 text-slate-950",
};

const iconToneClasses: Record<Tone, string> = {
  brand: "bg-brand-500 text-black",
  emerald: "bg-emerald-500 text-white",
  amber: "bg-amber-500 text-black",
  rose: "bg-rose-500 text-white",
  slate: "bg-slate-900 text-white",
};

export function ControlSectionIntro({
  eyebrow,
  title,
  description,
  bullets,
  tone = "brand",
  icon: Icon = Info,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  tone?: Tone;
  icon?: LucideIcon;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <Card
        variant="summary"
        className={cn(
          "border p-5 shadow-[0_12px_34px_-24px_rgba(15,23,42,0.22)]",
          toneClasses[tone],
        )}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                  iconToneClasses[tone],
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-70">
                  {eyebrow}
                </p>
                <h2 className="font-display mt-1 text-xl font-bold tracking-tight">{title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 opacity-85">{description}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:max-w-xl lg:justify-end">
            {bullets.map((bullet) => (
              <span
                key={bullet}
                className="rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700"
              >
                {bullet}
              </span>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant="feature"
      className={cn(
        "overflow-hidden border p-0 shadow-[0_12px_34px_-22px_rgba(15,23,42,0.25)]",
        toneClasses[tone],
      )}
    >
      <div className="bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.9),transparent_42%)] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] opacity-75">
              {eyebrow}
            </p>
            <div className="mt-3 flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                  iconToneClasses[tone],
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 opacity-85">{description}</p>
              </div>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:w-[27rem] lg:grid-cols-1">
            {bullets.map((bullet) => (
              <div
                key={bullet}
                className="flex items-start gap-2 rounded-2xl border border-white/70 bg-white/80 px-3 py-2.5 text-sm text-slate-800 shadow-sm"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ControlStatCard({
  label,
  value,
  hint,
  tone = "slate",
  icon: Icon = CircleDashed,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: Tone;
  icon?: LucideIcon;
}) {
  return (
    <Card
      variant="summary"
      className="relative overflow-hidden border border-slate-200/90 p-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]"
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-1",
          tone === "brand"
            ? "bg-brand-500"
            : tone === "emerald"
              ? "bg-emerald-500"
              : tone === "amber"
                ? "bg-amber-500"
                : tone === "rose"
                  ? "bg-rose-500"
                  : "bg-slate-300",
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{hint}</p>
        </div>
        <span
          className={cn(
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
            iconToneClasses[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </Card>
  );
}

export function ControlMiniGuide({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge: string;
}) {
  return (
    <Card
      variant="summary"
      className="border border-slate-200/90 p-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-base font-bold text-slate-950">{title}</h3>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
          {badge}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </Card>
  );
}

export function ControlActionTile({
  title,
  description,
  cta,
  icon: Icon = Info,
}: {
  title: string;
  description: string;
  cta: React.ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <Card
      variant="summary"
      className="border border-slate-200/90 p-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]"
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-bold text-slate-950">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          <div className="mt-3">{cta}</div>
        </div>
      </div>
    </Card>
  );
}

export function ControlFormSection({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-bold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function ControlAdvancedDetails({
  summary,
  children,
}: {
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <details className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-slate-900">
        {summary}
      </summary>
      <div className="mt-3 space-y-3">{children}</div>
    </details>
  );
}
