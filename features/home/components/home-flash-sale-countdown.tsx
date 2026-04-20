"use client";

import { useEffect, useMemo, useState } from "react";
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
};

/**
 * شريط عداد داخل بطاقة بيضاء متناسقة مع شريط الثقة (ظل خفيف + حلقة).
 * عدّ تنازلي حتى منتصف الليل المحلي.
 */
export function HomeFlashSaleCountdownStrip({
  className,
}: HomeFlashSaleCountdownStripProps) {
  const [msLeft, setMsLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0);
      setMsLeft(Math.max(0, end.getTime() - now));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const parts = useMemo(
    () => (msLeft === null ? null : splitHms(msLeft)),
    [msLeft],
  );

  const durationIso =
    msLeft === null
      ? undefined
      : `PT${Math.floor(msLeft / 1000)}S`;

  return (
    <div
      className={cn(
        "flex w-full max-w-md flex-col items-stretch gap-3 rounded-2xl bg-white px-3 py-3 shadow-[0_4px_18px_-6px_rgba(15,23,42,0.1)] ring-1 ring-black/[0.04] sm:max-w-lg sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-3.5",
        className,
      )}
    >
      <div className="flex items-center gap-3 sm:min-w-0 sm:flex-1">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-brand-950"
          aria-hidden
        >
          <BoltIcon />
        </span>
        <div className="min-w-0 text-start">
          <p className="text-xs font-bold leading-snug text-brand-950 sm:text-sm">
            ينتهي اليوم
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground sm:text-xs">
            متبقٍ على نهاية عروض اليوم
          </p>
        </div>
      </div>

      <div
        className="flex items-center justify-center gap-1.5 sm:shrink-0"
        role="timer"
        aria-live="polite"
        aria-atomic="true"
      >
        {parts === null ? (
          <>
            <TimeSegmentPlaceholder label="ساعة" />
            <span className="pb-4 text-sm font-bold text-muted-foreground/50" aria-hidden>
              :
            </span>
            <TimeSegmentPlaceholder label="دقيقة" />
            <span className="pb-4 text-sm font-bold text-muted-foreground/50" aria-hidden>
              :
            </span>
            <TimeSegmentPlaceholder label="ثانية" />
          </>
        ) : (
          <time
            className="contents"
            dateTime={durationIso}
            suppressHydrationWarning
          >
            <TimeSegment value={pad2(parts.h)} label="ساعة" />
            <span className="pb-4 text-sm font-bold text-muted-foreground/70" aria-hidden>
              :
            </span>
            <TimeSegment value={pad2(parts.m)} label="دقيقة" />
            <span className="pb-4 text-sm font-bold text-muted-foreground/70" aria-hidden>
              :
            </span>
            <TimeSegment value={pad2(parts.s)} label="ثانية" />
          </time>
        )}
      </div>
    </div>
  );
}

function TimeSegment({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-[3rem] flex-col items-center gap-0.5 sm:min-w-[3.25rem]">
      <span
        className="w-full rounded-xl bg-page px-2 py-1.5 text-center text-lg font-extrabold tabular-nums tracking-tight text-brand-950 shadow-inner ring-1 ring-black/[0.04] sm:text-xl"
        dir="ltr"
      >
        {value}
      </span>
      <span className="text-[10px] font-medium text-muted-foreground sm:text-[11px]">
        {label}
      </span>
    </div>
  );
}

function TimeSegmentPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex min-w-[3rem] flex-col items-center gap-0.5 sm:min-w-[3.25rem]">
      <span
        className="w-full rounded-xl bg-page px-2 py-1.5 text-center text-lg font-extrabold tabular-nums text-muted-foreground/50 sm:text-xl"
        dir="ltr"
        aria-hidden
      >
        --
      </span>
      <span className="text-[10px] font-medium text-muted-foreground sm:text-[11px]">
        {label}
      </span>
    </div>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M13 3L4 14h7l-1 8 10-12h-7l1-7z" />
    </svg>
  );
}
