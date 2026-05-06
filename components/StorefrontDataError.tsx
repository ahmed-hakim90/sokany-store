"use client";

import { StorefrontErrorScreen } from "@/components/StorefrontErrorScreen";
import { cn } from "@/lib/utils";

/*
 * فشل تحميل بيانات من الـ API (شبكة أو سيرفر Woo عبر BFF) — مظهر هادئ مثل ‎`EmptyState`‎
 * وليس صندوق خطأ أحمر؛ نصوص عربية للمستخدم.
 */
export function StorefrontDataError({
  title = "تعذّر تحميل البيانات",
  description = "حصلت مشكلة مؤقتة أثناء تحميل المحتوى. جرّب إعادة المحاولة، ولو استمرت المشكلة تواصل مع الدعم.",
  onRetry,
  detailMessage,
  showTechnicalDetails = false,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  /** تفاصيل تقنية — لا تظهر للمستخدم افتراضياً حتى في التطوير. */
  detailMessage?: string;
  showTechnicalDetails?: boolean;
  className?: string;
}) {
  return (
    <StorefrontErrorScreen
      tone="data"
      title={title}
      description={description}
      onRetry={onRetry}
      technicalDetails={detailMessage}
      showTechnicalDetails={showTechnicalDetails}
      compact
      className={cn(
        "border-dashed shadow-none",
        className,
      )}
    />
  );
}
