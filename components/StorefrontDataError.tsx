"use client";

import { StorefrontErrorScreen } from "@/components/StorefrontErrorScreen";
import { getStorefrontApiErrorCopy } from "@/lib/storefront-api-error";
import { cn } from "@/lib/utils";

/*
 * فشل تحميل بيانات من الـ API (شبكة أو سيرفر Woo عبر BFF) — مظهر هادئ مثل ‎`EmptyState`‎
 * وليس صندوق خطأ أحمر؛ نصوص عربية للمستخدم.
 */
export function StorefrontDataError({
  httpStatus,
  title: titleProp,
  description: descriptionProp,
  onRetry,
  detailMessage,
  showTechnicalDetails = false,
  className,
}: {
  /** إن وُجد، يُستخرج عنوان/وصف افتراضي من ‎`getStorefrontApiErrorCopy`‎. */
  httpStatus?: number;
  title?: string;
  description?: string;
  onRetry?: () => void;
  /** تفاصيل تقنية — لا تظهر للمستخدم افتراضياً حتى في التطوير. */
  detailMessage?: string;
  showTechnicalDetails?: boolean;
  className?: string;
}) {
  const fromStatus =
    httpStatus !== undefined ? getStorefrontApiErrorCopy(httpStatus) : null;
  const title =
    titleProp ?? fromStatus?.title ?? "تعذّر تحميل البيانات";
  const description =
    descriptionProp ??
    fromStatus?.description ??
    "حصلت مشكلة مؤقتة أثناء تحميل المحتوى. جرّب إعادة المحاولة، ولو استمرت المشكلة تواصل مع الدعم.";

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
