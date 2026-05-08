"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/Button";
import { usePwaDeferredInstall } from "@/components/PwaDeferredInstallProvider";
import { isClientRedirectSafeguardEnabled } from "@/lib/client-redirect-safeguard";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function getIosInstallHintSnapshot() {
  if (typeof window === "undefined" || !isClientRedirectSafeguardEnabled()) {
    return false;
  }
  const ua = window.navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isStandalone =
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(display-mode: standalone)").matches) ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  return isIos && !isStandalone;
}

function subscribeStaticSnapshot() {
  return () => {};
}

/**
 * تثبيت PWA عبر `beforeinstallprompt` فقط. تلميح iOS (userAgent) يظهر فقط مع `?redirect=1`.
 * التموضع: `PwaEngagementStack`. الحدث المؤجّل يُسجَّل في `PwaDeferredInstallProvider` مبكراً.
 */
export function PwaInstallPrompt() {
  const { deferred, clearDeferred } = usePwaDeferredInstall();
  const [dismissed, setDismissed] = useState(false);
  const iosHint = useSyncExternalStore(
    subscribeStaticSnapshot,
    getIosInstallHintSnapshot,
    () => false,
  );

  if (dismissed) return null;

  const ev = deferred as BeforeInstallPromptEvent | null;
  if (ev) {
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
              await ev.prompt();
              await ev.userChoice;
              clearDeferred();
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
