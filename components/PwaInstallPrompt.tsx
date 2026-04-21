"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * يعرض زر تثبيت التطبيق عند توفر الحدث (Chrome/Edge/Android).
 * على iOS Safari لا يوجد beforeinstallprompt — يُظهر تلميحاً نصياً فقط.
 */
export function PwaInstallPrompt() {
  const pathname = usePathname();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isIos && !isStandalone) {
      setIosHint(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    window.navigator.serviceWorker.register("/sw.js").catch(() => {
      /* ignore */
    });
  }, []);

  if (pathname?.startsWith("/control")) return null;

  if (dismissed) return null;

  if (deferred) {
    return (
      <div
        className="fixed bottom-4 left-4 right-4 z-[100] flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white/95 p-4 shadow-lg backdrop-blur-sm sm:left-auto sm:right-4 sm:max-w-md"
        role="status"
      >
        <p className="text-sm font-medium text-brand-950">ثبّت المتجر على شاشتك للوصول السريع.</p>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            onClick={async () => {
              await deferred.prompt();
              await deferred.userChoice;
              setDeferred(null);
            }}
          >
            تثبيت
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setDismissed(true)}>
            لاحقاً
          </Button>
        </div>
      </div>
    );
  }

  if (iosHint) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-[100] rounded-2xl border border-border bg-white/95 p-4 text-sm text-muted-foreground shadow-lg backdrop-blur-sm sm:left-auto sm:right-4 sm:max-w-md">
        على آيفون: اضغط مشاركة ثم «إضافة إلى الشاشة الرئيسية» لتثبيت الموقع.
        <Button type="button" size="sm" variant="ghost" className="mt-2" onClick={() => setDismissed(true)}>
          حسناً
        </Button>
      </div>
    );
  }

  return null;
}
