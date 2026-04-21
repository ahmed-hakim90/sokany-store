"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { requestWebPushSubscription } from "@/features/push/useFcmWebPush";

const STORAGE_KEY = "sokany-push-consent-dismissed";

export function WebPushConsentBanner() {
  const swEnabled = process.env.NEXT_PUBLIC_ENABLE_SW === "true";
  const vapidConfigured = Boolean(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim());
  const [hydrated, setHydrated] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [pending, setPending] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(window.localStorage.getItem(STORAGE_KEY) === "1");
    if ("Notification" in window) {
      setPermission(window.Notification.permission);
    }
    setHydrated(true);
  }, []);

  const show =
    hydrated &&
    swEnabled &&
    vapidConfigured &&
    !dismissed &&
    permission === "default" &&
    typeof window !== "undefined" &&
    "Notification" in window;

  if (!show) return null;

  return (
    <div
      className="w-full rounded-2xl border border-border bg-white/95 p-4 shadow-lg backdrop-blur-sm"
      role="dialog"
      aria-label="تفعيل الإشعارات"
    >
      <p className="text-sm font-medium text-brand-950">
        فعّل الإشعارات لتصلك عروض سوكانى وتنبيهات الطلب على هاتفك.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={pending}
          onClick={() => {
            setPending(true);
            void requestWebPushSubscription().finally(() => setPending(false));
          }}
        >
          {pending ? "جاري…" : "تفعيل الإشعارات"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, "1");
            setDismissed(true);
          }}
        >
          ليس الآن
        </Button>
      </div>
    </div>
  );
}
