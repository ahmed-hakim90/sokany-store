"use client";

import { cn } from "@/lib/utils";

export function CheckoutLoadingOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] flex items-center justify-center bg-black/45 backdrop-blur-[2px]",
      )}
      role="alert"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white px-10 py-8 shadow-xl">
        <span
          className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"
          aria-hidden
        />
        <p className="text-center text-sm font-semibold text-brand-950">جاري إرسال الطلب…</p>
        <p className="max-w-[240px] text-center text-xs text-muted-foreground">
          لا تغلق الصفحة حتى يكتمل التأكيد.
        </p>
      </div>
    </div>
  );
}
