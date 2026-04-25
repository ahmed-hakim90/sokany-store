"use client";

import { WifiOff } from "lucide-react";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";

/*
 * فشل تحميل بيانات من الـ API (شبكة أو سيرفر Woo عبر BFF) — مظهر هادئ مثل ‎`EmptyState`‎
 * وليس صندوق خطأ أحمر؛ نصوص عربية للمستخدم.
 */
export function StorefrontDataError({
  title = "تعذّر تحميل البيانات",
  description = "تأكّد من اتصال الواي فاي أو باقة بيانات الجوال، ثم أعِد المحاولة.",
  onRetry,
  detailMessage,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  /** تفاصيل تقنية — تُعرض في ‎`development` فقط عند عدم كونها فارغة. */
  detailMessage?: string;
  className?: string;
}) {
  const showDev =
    process.env.NODE_ENV === "development" && Boolean(detailMessage?.trim());

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-muted/25 px-6 py-12 text-center",
        className,
      )}
      role="alert"
    >
      <WifiOff
        className="mb-3 h-10 w-10 text-muted-foreground"
        strokeWidth={1.5}
        aria-hidden
      />
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {showDev ? (
        <p
          className="mt-3 max-w-lg break-words text-start text-xs text-muted-foreground/90"
          dir="ltr"
        >
          {detailMessage}
        </p>
      ) : null}
      {onRetry ? (
        <Button
          type="button"
          variant="primary"
          className="mt-6"
          onClick={onRetry}
        >
          إعادة المحاولة
        </Button>
      ) : null}
    </div>
  );
}
