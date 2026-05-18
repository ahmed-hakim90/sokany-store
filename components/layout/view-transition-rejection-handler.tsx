"use client";

import { useEffect } from "react";

/**
 * رفض متوقع من View Transitions API (next-view-transitions + Chrome):
 * — تنقل جديد يقطع انتقالاً قيد التشغيل (AbortError)
 * — بطء RSC/تجميع dev يتجاوز مهلة تحديث DOM (TimeoutError)
 */
export function isBenignViewTransitionRejection(reason: unknown): boolean {
  if (!reason || typeof reason !== "object") return false;
  const { name, message } = reason as { name?: string; message?: string };
  if (typeof message !== "string") return false;

  if (name === "AbortError" && message.includes("Transition was skipped")) {
    return true;
  }
  if (
    name === "TimeoutError" &&
    message.includes("Transition was aborted because of timeout in DOM update")
  ) {
    return true;
  }
  return false;
}

/**
 * يمنع ضجيج `unhandledRejection` في الكونسول لرفضات الانتقال المتوقعة أعلاه.
 */
export function ViewTransitionRejectionHandler() {
  useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isBenignViewTransitionRejection(event.reason)) {
        event.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () =>
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
  }, []);
  return null;
}
