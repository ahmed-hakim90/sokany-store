"use client";

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

/** فوق شريط التنقل/السلة — يُضبط ارتفاع الكروم في `MobileCommerceChrome`. */
const MOBILE_TOAST_BOTTOM =
  "calc(env(safe-area-inset-bottom, 0px) + var(--mobile-commerce-chrome-height, 5rem) + 0.75rem)";

const toastClassNames = {
  toast: cn(
    "!gap-3 !rounded-3xl !border !border-white/50 !p-4 !shadow-[0_20px_48px_-16px_rgba(15,23,42,0.28),0_4px_12px_-4px_rgba(15,23,42,0.1)]",
    "!bg-white/90 !backdrop-blur-2xl !backdrop-saturate-150",
    "!text-slate-900",
  ),
  title: "font-display text-sm font-semibold tracking-tight text-inherit",
  description: "text-sm font-normal leading-snug text-slate-600",
  success:
    "!border-emerald-400/45 !bg-emerald-50/95 !text-emerald-950 [&_[data-description]]:!text-emerald-900/80",
  error:
    "!border-rose-400/45 !bg-rose-50/95 !text-rose-950 [&_[data-description]]:!text-rose-900/80",
  info: "!border-sky-300/50 !bg-sky-50/92 !text-slate-900 [&_[data-description]]:!text-slate-600",
  warning:
    "!border-amber-400/45 !bg-amber-50/92 !text-amber-950 [&_[data-description]]:!text-amber-900/85",
  default:
    "!border-slate-300/55 !bg-slate-50/95 !text-slate-900 [&_[data-description]]:!text-slate-600",
  loading:
    "!border-slate-300/55 !bg-white/90 !text-slate-900 [&_[data-description]]:!text-slate-600",
  icon: "[&_svg]:size-5 shrink-0",
  closeButton:
    "!h-9 !w-9 !border-0 !rounded-full !bg-slate-100/95 !text-slate-600 !shadow-sm !ring-1 !ring-slate-900/5 transition-colors hover:!bg-slate-200/90",
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
            className="size-5 shrink-0 text-emerald-600"
            aria-hidden
          />
        ),
        error: <XCircle className="size-5 shrink-0 text-rose-600" aria-hidden />,
        info: <Info className="size-5 shrink-0 text-sky-600" aria-hidden />,
        warning: (
          <AlertTriangle className="size-5 shrink-0 text-amber-600" aria-hidden />
        ),
        loading: (
          <Loader2
            className="size-5 shrink-0 animate-spin text-slate-600"
            aria-hidden
          />
        ),
        close: <X className="size-4" aria-hidden />,
      }}
    />
  );
}
