"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { requestWebPushSubscription } from "@/features/push/useFcmWebPush";

/** تخزين مؤقّت للجلسة فقط: يظهر البانر مجددًا عند زيارة جديدة (تبويب/جلسة) إن لم يُفعّل الإشعار. */
const SESSION_DISMISS_KEY = "sokany-push-consent-dismissed";

function readSessionDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(SESSION_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function writeSessionDismissed(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
  } catch {
    /* private mode or quota */
  }
}

export function WebPushConsentBanner() {
  const swEnabled = process.env.NEXT_PUBLIC_ENABLE_SW === "true";
  const vapidConfigured = Boolean(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim());
  const [hydrated, setHydrated] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [pending, setPending] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  const syncPermission = useCallback(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(window.Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setDismissed(readSessionDismissed());
      syncPermission();
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [syncPermission]);

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") return;
    const onVisible = () => {
      if (document.visibilityState === "visible") syncPermission();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [syncPermission]);

  const showRelevantState =
    permission === "default" || permission === "denied";

  const show =
    hydrated &&
    swEnabled &&
    vapidConfigured &&
    !dismissed &&
    showRelevantState &&
    typeof window !== "undefined" &&
    "Notification" in window;

  if (!show) return null;

  return (
    <div
      className="w-full rounded-2xl border border-border bg-white/95 p-4 shadow-lg backdrop-blur-sm"
      role="dialog"
      aria-label="تفعيل الإشعارات"
    >
      {permission === "default" ? (
        <>
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
                void requestWebPushSubscription()
                  .then(() => syncPermission())
                  .finally(() => setPending(false));
              }}
            >
              {pending ? "جاري…" : "تفعيل الإشعارات"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                writeSessionDismissed();
                setDismissed(true);
              }}
            >
              ليس الآن
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-brand-950">
            تم رفض إشعارات الموقع سابقًا. فعّل «الإشعارات» لسوكانى من إعدادات
            المتصفح: اضغط أيقونة القفل أو (i) بجانب شريط العنوان، ثم اختر
            «السماح» للإشعارات. بعدها يمكنك الضغط أدناه.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={() => {
                setPending(true);
                void requestWebPushSubscription()
                  .then(() => syncPermission())
                  .finally(() => setPending(false));
              }}
            >
              {pending ? "جاري…" : "تفعيل الإشعارات"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                writeSessionDismissed();
                setDismissed(true);
              }}
            >
              ليس الآن
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
