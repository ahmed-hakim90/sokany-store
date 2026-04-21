"use client";

import { getToken, onMessage, type Messaging } from "firebase/messaging";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { getFirebaseMessaging } from "@/lib/firebase";

const VAPID = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export const SOKANY_PUSH_GRANTED_EVENT = "sokany-push-granted";

async function registerTokenWithServer(messaging: Messaging): Promise<void> {
  if (!VAPID?.trim()) return;
  const registration = await navigator.serviceWorker.ready;
  const token = await getToken(messaging, {
    vapidKey: VAPID,
    serviceWorkerRegistration: registration,
  });
  if (!token) return;
  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? "فشل تسجيل الإشعارات");
  }
}

/**
 * عند منح الإذن: تسجيل FCM مع `/api/push/subscribe` واستقبال الرسائل في المقدمة (toast).
 * يعيد الربط عند تغيّر إذن الإشعارات أو بعد حدث `sokany-push-granted`.
 * @param enabled يُعطَّل على صفحات لوحة التحكم.
 */
export function useFcmWebPush(enabled: boolean): void {
  const offRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (!enabled || !VAPID?.trim()) return;

    let cancelled = false;

    const connect = async () => {
      offRef.current?.();
      offRef.current = undefined;
      if (cancelled || typeof window === "undefined" || Notification.permission !== "granted") {
        return;
      }
      const messaging = await getFirebaseMessaging();
      if (!messaging || cancelled) return;
      try {
        await registerTokenWithServer(messaging);
      } catch {
        /* الخادم قد يكون غير مهيأ */
      }
      offRef.current = onMessage(messaging, (payload) => {
        const title = payload.notification?.title ?? "إشعار";
        const body = payload.notification?.body ?? "";
        toast(title, { description: body || undefined, duration: 8000 });
      });
    };

    const onGranted = () => void connect();
    window.addEventListener(SOKANY_PUSH_GRANTED_EVENT, onGranted);

    let perm: PermissionStatus | undefined;
    const permHandler = () => void connect();
    const subPerm = async () => {
      try {
        if (navigator.permissions?.query) {
          perm = await navigator.permissions.query({ name: "notifications" as PermissionName });
          perm.addEventListener("change", permHandler);
        }
      } catch {
        /* ignore */
      }
    };
    void subPerm();
    void connect();

    return () => {
      cancelled = true;
      window.removeEventListener(SOKANY_PUSH_GRANTED_EVENT, onGranted);
      perm?.removeEventListener("change", permHandler);
      offRef.current?.();
      offRef.current = undefined;
    };
  }, [enabled]);
}

export async function requestWebPushSubscription(): Promise<{ ok: boolean }> {
  if (!VAPID?.trim()) {
    toast.error("الإشعارات غير مهيأة على الخادم.");
    return { ok: false };
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    toast.message("لم يُمنح إذن الإشعارات.");
    return { ok: false };
  }
  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    toast.error("المتصفح لا يدعم إشعارات الويب.");
    return { ok: false };
  }
  try {
    await registerTokenWithServer(messaging);
    window.dispatchEvent(new Event(SOKANY_PUSH_GRANTED_EVENT));
    toast.success("تم تفعيل الإشعارات — ستصلك تنبيهات العروض والطلبات.");
    return { ok: true };
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "تعذّر التفعيل");
    return { ok: false };
  }
}
