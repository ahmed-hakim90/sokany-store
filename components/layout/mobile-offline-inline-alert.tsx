"use client";

/**
 * تنبيه عدم اتصال — مدمج تحت الهيدر (بدل البانر العائم الثقيلة).
 *
 * الشاشات: عمود عمودية صغيرة، زر إغلاق ذاتي؛ يعود التنبيه تلقائياً بعد عودة الشبكة.
 */
import { useEffect, useState } from "react";
import { WifiOff, X } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { cn } from "@/lib/utils";

export function MobileOfflineInlineAlert() {
  const { offline } = useNetworkStatus();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!offline) {
      queueMicrotask(() => setDismissed(false));
    }
  }, [offline]);

  if (!offline || dismissed) return null;

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-2xl border border-semantic-warning-border/55",
        "bg-[color-mix(in_srgb,var(--semantic-warning-surface)_92%,white)]",
        "px-3 py-2.5 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.25)] ring-1 ring-black/[0.04]",
      )}
      role="status"
      aria-live="polite"
    >
      <WifiOff
        className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 text-[var(--semantic-warning-icon)]"
        aria-hidden
      />
      <div className="min-w-0 flex-1 text-start leading-snug">
        <p className="text-[12px] font-bold text-brand-950">أنت غير متصل بالإنترنت</p>
        <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
          سيتم عرض آخر نسخة محفوظة
        </p>
      </div>
      <button
        type="button"
        className="-m-1 inline-flex shrink-0 rounded-xl p-1.5 text-brand-950/70 transition-colors duration-150 hover:bg-black/[0.05] hover:text-brand-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        aria-label="إخفاء تنبيه الشبكة"
        onClick={() => setDismissed(true)}
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
