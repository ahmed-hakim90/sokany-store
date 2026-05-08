"use client";

import { cn } from "@/lib/utils";

type Props = {
  variant?: "offline-cache" | "api-fallback";
  className?: string;
};

/**
 * إشعار ناعم عند عرض بيانات من الكاش بعد فشل الشبكة أو الـ API.
 */
export function StorefrontStaleDataNotice({ variant, className }: Props) {
  const message =
    variant === "offline-cache"
      ? "نعرض نسخة محفوظة — أنت غير متصل حالياً."
      : "نعرض نسخة محفوظة بسبب مشكلة مؤقتة بالاتصال.";

  return (
    <div
      className={cn(
        "rounded-xl border border-amber-200/90 bg-amber-50/95 px-3 py-2 text-center text-xs font-medium text-amber-950 sm:text-sm",
        className,
      )}
      role="status"
    >
      {message}
    </div>
  );
}
