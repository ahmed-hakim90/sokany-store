"use client";

import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { cn } from "@/lib/utils";

/**
 * شريط غير متصل — لا يغطي المحتوى التفاعلي (‎`pointer-events-none`‎ على الغلاف).
 */
export function StorefrontOfflineBanner() {
  const { offline } = useNetworkStatus();
  if (!offline) return null;
  return (
    <div
      className={cn(
        "pointer-events-none sticky top-0 z-[60] flex justify-center px-2 pt-[env(safe-area-inset-top)]",
      )}
      role="status"
      aria-live="polite"
    >
      <p className="pointer-events-auto max-w-lg rounded-b-lg bg-amber-950 px-4 py-2 text-center text-xs font-semibold text-amber-50 shadow-md sm:text-sm">
        أنت غير متصل بالإنترنت — يتم عرض آخر نسخة محفوظة
      </p>
    </div>
  );
}
