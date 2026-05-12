"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { useMobileAssistantOpenStore } from "@/components/layout/mobile-assistant-open-store";
import { StorefrontAssistantChatPanel } from "@/features/assistant/components/StorefrontAssistantChatPanel";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const MOBILE_ASSISTANT_QUERY = "(max-width: 1023px)";

export function StorefrontAssistantWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const setAssistantOpen = useMobileAssistantOpenStore((s) => s.setOpen);
  const [open, setOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  const isAssistantPage = pathname === ROUTES.ASSISTANT;
  const isCheckout = pathname === ROUTES.CHECKOUT;

  useEffect(() => {
    setAssistantOpen(isAssistantPage ? false : open);
  }, [isAssistantPage, open, setAssistantOpen]);

  useEffect(() => {
    return () => setAssistantOpen(false);
  }, [setAssistantOpen]);

  useEffect(() => {
    if (isAssistantPage || open) {
      setShowIntro(false);
      return;
    }
    setShowIntro(true);
    const timer = window.setTimeout(() => setShowIntro(false), 6500);
    return () => window.clearTimeout(timer);
  }, [pathname, isAssistantPage, open]);

  function openAssistant() {
    setShowIntro(false);
    if (window.matchMedia(MOBILE_ASSISTANT_QUERY).matches) {
      setOpen(false);
      router.push(ROUTES.ASSISTANT);
      return;
    }
    setOpen((value) => !value);
  }

  if (isAssistantPage) return null;

  return (
    <section
      dir="rtl"
      aria-label="مساعد سوكاني"
      className={cn(
        "fixed start-4 z-[54] bottom-mobile-floating-actions lg:bottom-8",
        isCheckout && "max-lg:hidden",
      )}
    >
      {open ? (
        <StorefrontAssistantChatPanel
          className="absolute bottom-14 start-0 w-[min(calc(100vw-2rem),24rem)]"
          onClose={() => setOpen(false)}
        />
      ) : null}

      {showIntro && !open ? (
        <div className="absolute bottom-14 start-0 w-[min(calc(100vw-2rem),20rem)] animate-fade-in rounded-2xl border border-brand-200 bg-white p-3 text-start shadow-xl motion-reduce:animate-none">
          <button
            type="button"
            onClick={() => setShowIntro(false)}
            className="absolute left-2 top-2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            aria-label="إخفاء رسالة مساعد سوكاني"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
          <div className="flex items-start gap-2 pe-5">
            <span
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg"
              aria-hidden
            >
              💬
            </span>
            <div>
              <p className="text-sm font-semibold text-brand-950">مساعد سوكاني جاهز</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                اسألني عن المنتجات، افضل سعر، الفروع، الضمان والعروض.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={openAssistant}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-950 text-white shadow-[0_12px_28px_-14px_rgba(15,23,42,0.9)] transition-[background-color,transform,box-shadow] duration-200 ease-out hover:bg-brand-900 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 motion-reduce:transition-none"
        aria-label={open ? "إغلاق مساعد سوكاني" : "فتح مساعد سوكاني"}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <MessageCircle className="h-5 w-5" aria-hidden />}
      </button>
    </section>
  );
}
