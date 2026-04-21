"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * بطاقة تثبيت PWA (Chrome/Edge/Android). على iOS Safari يُظهر تلميح «إضافة للشاشة الرئيسية».
 * التموضع الثابت يُدار من `PwaEngagementStack`.
 */
export function PwaInstallPrompt() {
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

  if (dismissed) return null;

  if (deferred) {
    return (
      <div
        className="w-full rounded-2xl border border-border bg-white/95 p-4 shadow-lg backdrop-blur-sm"
        role="status"
      >
        <p className="text-sm font-medium text-brand-950">ثبّت المتجر على شاشتك للوصول السريع.</p>
        <div className="mt-3 flex flex-wrap gap-2">
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
      <div className="w-full rounded-2xl border border-border bg-white/95 p-4 text-sm text-muted-foreground shadow-lg backdrop-blur-sm">
        على آيفون: اضغط مشاركة ثم «إضافة إلى الشاشة الرئيسية» لتثبيت الموقع.
        <Button type="button" size="sm" variant="ghost" className="mt-2" onClick={() => setDismissed(true)}>
          حسناً
        </Button>
      </div>
    );
  }

  return null;
}
