"use client";

import { useEffect } from "react";

/**
 * يمنع ظهور `unhandledRejection: AbortError: Transition was skipped` في الكونسول
 * عندما يقطع تنقل جديد انتقال View Transitions قيد التشغيل (next-view-transitions + المستعرض).
 */
export function ViewTransitionRejectionHandler() {
  useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const r = event.reason as { name?: string; message?: string } | undefined;
      if (
        r &&
        typeof r === "object" &&
        r.name === "AbortError" &&
        typeof r.message === "string" &&
        r.message.includes("Transition was skipped")
      ) {
        event.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () =>
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
  }, []);
  return null;
}
