"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/Button";
import { usePwaDeferredInstall } from "@/components/PwaDeferredInstallProvider";
import { useMinLg } from "@/hooks/useMinLg";
import { isClientRedirectSafeguardEnabled } from "@/lib/client-redirect-safeguard";
import { PWA_INSTALL_NAME } from "@/lib/constants";
import { STOREFRONT_Z } from "@/lib/storefront-overlay-z";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const PWA_BENEFITS = [
  "افتح المتجر بسرعة",
  "تتبع طلباتك",
  "عروض وتنبيهات",
] as const;

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

function PwaBenefitsList({ className }: { className?: string }) {
  return (
    <ul className={cn("mt-3 space-y-1.5 text-sm text-muted-foreground", className)}>
      {PWA_BENEFITS.map((line) => (
        <li key={line} className="flex items-center gap-2">
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-900"
            aria-hidden
          >
            ✓
          </span>
          {line}
        </li>
      ))}
    </ul>
  );
}

function PwaInstallCard({
  title,
  children,
  onDismiss,
}: {
  title: string;
  children: React.ReactNode;
  onDismiss: () => void;
}) {
  return (
    <div
      className="surface-glass w-full overflow-hidden rounded-2xl border border-border/80 p-4 shadow-lg"
      role="status"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-lg font-black text-black"
          aria-hidden
        >
          ⬡
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold text-brand-950">{title}</p>
          <PwaBenefitsList />
        </div>
        <button
          type="button"
          className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-surface-muted/80 hover:text-brand-950"
          aria-label="إغلاق"
          onClick={onDismiss}
        >
          <CloseIcon />
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

/**
 * زرار/بطاقة تثبيت PWA — المنطق كما هو؛ العرض فقط أعيد تصميمه.
 */
export function PwaInstallPrompt() {
  const { deferred, clearDeferred } = usePwaDeferredInstall();
  const [dismissed, setDismissed] = useState(false);
  const lgUp = useMinLg();
  const iosHint = useSyncExternalStore(
    subscribeStaticSnapshot,
    getIosInstallHintSnapshot,
    () => false,
  );

  if (dismissed) return null;

  const ev = deferred as BeforeInstallPromptEvent | null;
  const dismiss = () => setDismissed(true);

  if (ev) {
    const installActions = (
      <>
        <Button
          type="button"
          size="sm"
          className="font-bold"
          onClick={async () => {
            await ev.prompt();
            await ev.userChoice;
            clearDeferred();
          }}
        >
          تثبيت التطبيق
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={dismiss}>
          لاحقاً
        </Button>
      </>
    );

    if (!lgUp) {
      return (
        <div
          className="pointer-events-auto fixed inset-x-0 bottom-0 max-lg:pb-[env(safe-area-inset-bottom)]"
          style={{ zIndex: STOREFRONT_Z.pwaPrompt }}
        >
          <div className="rounded-t-3xl border border-border/80 bg-white/98 p-4 shadow-[0_-12px_40px_-12px_rgba(15,23,42,0.25)] backdrop-blur-xl">
            <p className="font-display text-base font-bold text-brand-950">
              ثبّت {PWA_INSTALL_NAME} على شاشتك
            </p>
            <PwaBenefitsList />
            <div className="mt-4 flex flex-wrap gap-2">{installActions}</div>
            <button
              type="button"
              className="mt-2 w-full py-2 text-center text-xs font-medium text-muted-foreground"
              onClick={dismiss}
            >
              ليس الآن
            </button>
          </div>
        </div>
      );
    }

    return (
      <PwaInstallCard title={`ثبّت ${PWA_INSTALL_NAME} للوصول السريع`} onDismiss={dismiss}>
        {installActions}
      </PwaInstallCard>
    );
  }

  if (iosHint) {
    return (
      <PwaInstallCard title="أضف المتجر إلى الشاشة الرئيسية" onDismiss={dismiss}>
        <p className="w-full text-sm text-muted-foreground">
          على آيفون: اضغط مشاركة ثم «إضافة إلى الشاشة الرئيسية».
        </p>
        <Button type="button" size="sm" variant="ghost" onClick={dismiss}>
          حسناً
        </Button>
      </PwaInstallCard>
    );
  }

  return null;
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}
