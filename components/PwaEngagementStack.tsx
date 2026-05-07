"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useFcmWebPush } from "@/features/push/useFcmWebPush";
import { scheduleIdleCallback } from "@/lib/schedule-idle-callback";

const PwaInstallPrompt = dynamic(
  () => import("@/components/PwaInstallPrompt").then((m) => m.PwaInstallPrompt),
  { ssr: false, loading: () => null },
);

const WebPushConsentBanner = dynamic(
  () =>
    import("@/components/WebPushConsentBanner").then(
      (m) => m.WebPushConsentBanner,
    ),
  { ssr: false, loading: () => null },
);

/**
 * تسجيل Service Worker مرة واحدة، ثم بطاقات: تثبيت PWA + موافقة إشعارات FCM.
 */
export function PwaEngagementStack() {
  const pathname = usePathname();
  const storefront = !pathname?.startsWith("/control");
  const swEnabled = process.env.NEXT_PUBLIC_ENABLE_SW === "true";
  const [idleReady, setIdleReady] = useState(false);
  useFcmWebPush(storefront && swEnabled && idleReady);

  useEffect(
    () =>
      scheduleIdleCallback(() => setIdleReady(true), {
        timeout: 3500,
      }),
    [],
  );

  useEffect(() => {
    if (!idleReady) return;
    if (!storefront) return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (!swEnabled) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister())))
        .catch(() => {
          /* ignore */
        });
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* ignore */
    });
  }, [idleReady, storefront, swEnabled]);

  if (!storefront || !idleReady) return null;

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
