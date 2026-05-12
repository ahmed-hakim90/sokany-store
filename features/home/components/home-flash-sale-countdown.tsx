"use client";

import { Zap } from "lucide-react";
import { Link } from "next-view-transitions";
import { useEffect, useMemo, useState } from "react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

function splitHms(totalMs: number): { h: number; m: number; s: number } {
  if (totalMs <= 0) return { h: 0, m: 0, s: 0 };
  const sec = Math.floor(totalMs / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return { h, m, s };
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

type HomeFlashSaleCountdownStripProps = {
  className?: string;
  /** يطابق `aria-labelledby` على الـ section الأب (عنوان القسم المرئي داخل البانر). */
  titleId?: string;
  /** نهاية العد التنازلي — ISO 8601؛ عند الغياب يُستخدم نهاية يوم التقويم الحالي. */
  endsAtIso?: string | null;
  headline?: string;
  subline?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

/*
 * بانر «عروض سريعة»: خلفية فحمية مع وهج لايم، شارة عنوان، نص فرعي، عداد بخلايا شفافة على سطر واحد، زر CTA.
 * على الموبايل والديسكتوب: عمود متمركز؛ الأرقام LTR داخل الخلايا.
 */
export function HomeFlashSaleCountdownStrip({
  className,
  titleId = "home-flash-sales-title",
  endsAtIso,
  headline = "ينتهي اليوم",
  subline = "خصومات لفترة محدودة — تنتهي مع نهاية يوم اليوم.",
  ctaHref = ROUTES.OFFERS,
  ctaLabel = "تسوق الآن",
}: HomeFlashSaleCountdownStripProps) {
  const [msLeft, setMsLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      let endMs: number;
      if (endsAtIso) {
        const parsed = Date.parse(endsAtIso);
        endMs = Number.isFinite(parsed) ? parsed : now;
      } else {
        const end = new Date(now);
        end.setHours(24, 0, 0, 0);
        endMs = end.getTime();
      }
      setMsLeft(Math.max(0, endMs - now));
    };
    tick();
    let id: number | undefined;
    const start = () => {
      if (id !== undefined || document.hidden) return;
      id = window.setInterval(tick, 1000);
    };
    const stop = () => {
      if (id !== undefined) {
        window.clearInterval(id);
        id = undefined;
      }
    };
    const onVis = () => {
      if (document.hidden) stop();
      else {
        tick();
        start();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    start();
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [endsAtIso]);

  const parts = useMemo(
    () => (msLeft === null ? null : splitHms(msLeft)),
    [msLeft],
  );

  const durationIso =
    msLeft === null ? undefined : `PT${Math.floor(msLeft / 1000)}S`;

  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center gap-6 overflow-hidden rounded-[2rem] border border-brand-500/30 bg-brand-950 p-6 text-white shadow-[0_24px_80px_-44px_rgba(10,10,10,0.85)] sm:gap-8 sm:p-8",
        className,
      )}
    >
      {/* وهج زخرفي */}
      <div
        className="pointer-events-none absolute -bottom-12 -start-16 h-48 w-48 rounded-full bg-brand-500/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-brand-400/15 blur-3xl"
        aria-hidden
      />

      {/* أيقونة برق كبيرة خلفية */}
      <div
        className="pointer-events-none absolute end-0 top-0 p-4 opacity-[0.12] sm:p-8"
        aria-hidden
      >
        <Zap className="size-24 text-brand-500 sm:size-[7.5rem]" strokeWidth={1.25} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-2 text-center">
        <h2
          id={titleId}
          className="inline-block rounded-full bg-brand-500 px-4 py-1.5 text-[10px] font-black text-brand-950 shadow-[0_0_24px_-10px_rgba(218,255,0,0.85)]"
        >
          عروض سريعة
        </h2>
        <p className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          {headline}
        </p>
        <p className="max-w-md text-sm font-medium text-white/75">{subline}</p>
      </div>

      <div
        className="relative z-10 flex w-full max-w-sm items-center justify-center gap-1.5 sm:max-w-md sm:gap-2 md:max-w-lg"
        role="timer"
        aria-live="polite"
        aria-atomic="true"
      >
        {parts === null ? (
          <>
            <TimeSegmentPlaceholder label="ساعة" />
            <TimerColon />
            <TimeSegmentPlaceholder label="دقيقة" />
            <TimerColon />
            <TimeSegmentPlaceholder label="ثانية" />
          </>
        ) : (
          <time
            className="contents"
            dateTime={durationIso}
            suppressHydrationWarning
          >
            <TimeSegment value={pad2(parts.h)} label="ساعة" />
            <TimerColon />
            <TimeSegment value={pad2(parts.m)} label="دقيقة" />
            <TimerColon />
            <TimeSegment value={pad2(parts.s)} label="ثانية" />
          </time>
        )}
      </div>

      <Link
        href={ctaHref}
        className="relative z-10 flex h-11 w-full max-w-sm items-center justify-center rounded-xl border-2 border-brand-500/90 bg-brand-950/80 px-6 text-sm font-bold text-brand-500 shadow-[0_0_24px_-8px_rgba(218,255,0,0.45)] transition-colors hover:bg-brand-500 hover:text-brand-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:max-w-md"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

function TimerColon() {
  return (
    <span
      className="select-none pb-6 text-2xl font-bold leading-none text-white/45 sm:text-3xl md:pb-7 md:text-4xl"
      aria-hidden
    >
      :
    </span>
  );
}

function TimeSegment({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
      <div
        className="w-full rounded-2xl border border-brand-500/20 bg-white/10 px-1 py-3 text-center text-2xl font-black tabular-nums tracking-tight text-white shadow-inner backdrop-blur-sm sm:px-2 sm:py-4 sm:text-3xl md:py-5 md:text-4xl"
        dir="ltr"
      >
        {value}
      </div>
      <span className="text-[10px] font-bold tracking-wide text-white/75">
        {label}
      </span>
    </div>
  );
}

function TimeSegmentPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
      <div
        className="w-full rounded-2xl border border-brand-500/10 bg-white/5 px-1 py-3 text-center text-2xl font-black tabular-nums text-white/35 sm:px-2 sm:py-4 sm:text-3xl md:py-5 md:text-4xl"
        dir="ltr"
        aria-hidden
      >
        --
      </div>
      <span className="text-[10px] font-bold tracking-wide text-white/60">
        {label}
      </span>
    </div>
  );
}
