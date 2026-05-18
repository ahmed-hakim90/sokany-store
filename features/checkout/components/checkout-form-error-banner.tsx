"use client";

import { AlertCircle } from "lucide-react";
import type { CheckoutFormData } from "@/features/checkout/types";
import { cn } from "@/lib/utils";

export function CheckoutFormErrorBanner({
  errors,
  className,
}: {
  errors: Partial<Record<keyof CheckoutFormData, string>>;
  className?: string;
}) {
  const count = Object.keys(errors).length;
  if (count === 0) return null;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2.5 rounded-xl border border-red-200/90 bg-red-50 px-3 py-3 text-sm text-red-900",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden />
      <div className="min-w-0 text-start">
        <p className="font-semibold">يرجى مراجعة البيانات</p>
        <p className="mt-0.5 text-xs leading-relaxed text-red-800/90">
          {count === 1
            ? "يوجد حقل واحد يحتاج تصحيحاً — راجع التنبيه أسفل الحقل."
            : `يوجد ${count} حقول تحتاج تصحيحاً — راجع التنبيهات أسفل الحقول.`}
        </p>
      </div>
    </div>
  );
}
