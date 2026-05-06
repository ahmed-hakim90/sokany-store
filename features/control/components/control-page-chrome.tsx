"use client";

import type { LucideIcon } from "lucide-react";
import { CheckCircle2, CircleDashed, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tone = "brand" | "emerald" | "amber" | "rose" | "slate";

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
