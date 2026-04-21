"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import { WebPushConsentBanner } from "@/components/WebPushConsentBanner";
import { useFcmWebPush } from "@/features/push/useFcmWebPush";

/**
 * تسجيل Service Worker مرة واحدة، ثم بطاقات: تثبيت PWA + موافقة إشعارات FCM.
 */
export function PwaEngagementStack() {
  const pathname = usePathname();
  const storefront = !pathname?.startsWith("/control");
  useFcmWebPush(storefront);

  useEffect(() => {
    if (!storefront) return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* ignore */
    });
  }, [storefront]);

  if (!storefront) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 right-4 z-[100] flex flex-col gap-3 sm:left-auto sm:right-4 sm:max-w-md">
      <div className="pointer-events-auto">
        <PwaInstallPrompt />
      </div>
      <div className="pointer-events-auto">
        <WebPushConsentBanner />
      </div>
    </div>
  );
}
