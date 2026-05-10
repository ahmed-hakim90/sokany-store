"use client";

/**
 * Toasts عربية RTL
 * بالعامية: Sonner مع كلاسات التصميم؛ `mobileOffset` يفوق شريط التجارة عشان الزرار ما يغطيش الرسايل.
 */
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  X,
  XCircle,
} from "lucide-react";
import { Toaster } from "sonner";
import type { ToastClassnames } from "sonner";
import { cn } from "@/lib/utils";

/** فوق الكروم السفلي — الارتفاع من متغير CSS يحدده `MobileCommerceChrome`. */
const MOBILE_TOAST_BOTTOM =
  "calc(env(safe-area-inset-bottom, 0px) + var(--mobile-commerce-chrome-height, 5rem) + 0.75rem)";

const toastClassNames = {
  toast: cn(
    "surface-glass !gap-3 !rounded-3xl !border !p-4 !backdrop-blur-2xl",
    "!text-foreground",
  ),
  title: "font-display text-sm font-semibold tracking-tight text-inherit",
  description: "text-sm font-normal leading-snug text-muted-foreground",
  success:
    "!border-success-border !bg-success-surface !text-success-foreground [&_[data-description]]:!text-success-foreground/80",
  error:
    "!border-destructive-border !bg-destructive-surface !text-destructive-foreground [&_[data-description]]:!text-destructive-foreground/85",
  info: "!border-info-border !bg-info-surface !text-info-foreground [&_[data-description]]:!text-muted-foreground",
  warning:
    "!border-warning-border !bg-warning-surface !text-warning-foreground [&_[data-description]]:!text-warning-foreground/88",
  default:
    "!border-border/80 !bg-background/95 !text-foreground [&_[data-description]]:!text-muted-foreground",
  loading:
    "!border-border/80 !bg-background/95 !text-foreground [&_[data-description]]:!text-muted-foreground",
  icon: "[&_svg]:size-5 shrink-0",
  closeButton:
    "!h-9 !w-9 !border-0 !rounded-full !bg-surface-muted/90 !text-muted-foreground !shadow-sm !ring-1 !ring-foreground/5 transition-colors hover:!bg-surface-muted",
} satisfies ToastClassnames;

export function ToastProvider() {
  return (
    <Toaster
      dir="rtl"
      position="bottom-center"
      richColors={false}
      closeButton
      duration={4000}
      gap={10}
      offset={{ bottom: "1.5rem" }}
      mobileOffset={{ bottom: MOBILE_TOAST_BOTTOM }}
      toastOptions={{
        classNames: toastClassNames,
      }}
      icons={{
        success: (
          <CheckCircle2
            className="size-5 shrink-0 text-success-icon"
            aria-hidden
          />
        ),
        error: (
          <XCircle className="size-5 shrink-0 text-destructive-icon" aria-hidden />
        ),
        info: <Info className="size-5 shrink-0 text-info-icon" aria-hidden />,
        warning: (
          <AlertTriangle
            className="size-5 shrink-0 text-warning-icon"
            aria-hidden
          />
        ),
        loading: (
          <Loader2
            className="size-5 shrink-0 animate-spin text-muted-foreground"
            aria-hidden
          />
        ),
        close: <X className="size-4" aria-hidden />,
      }}
    />
  );
}
