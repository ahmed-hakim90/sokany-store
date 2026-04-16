"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { MobileTopHeader } from "@/components/layout/mobile-top-header";

export type TopHeaderProps = {
  logo: React.ReactNode;
  /** e.g. search — optional center slot */
  center?: React.ReactNode;
  /** Primary navigation, typically hidden on small screens */
  desktopNav?: React.ReactNode;
  /** Desktop header trailing (e.g. cart) */
  trailing: React.ReactNode;
  /** Collapsible block under the bar (mobile menu); visibility controlled by parent */
  mobilePanel?: React.ReactNode;
  mobilePanelOpen?: boolean;
  /** Close full-screen mobile overlay (backdrop / dismiss). */
  onMobilePanelClose?: () => void;
  mobileWordmark: React.ReactNode;
  mobileLeading: React.ReactNode;
  mobileTrailing: React.ReactNode;
  mobileToolbarBelow?: React.ReactNode;
  mobileSecondary?: React.ReactNode;
  className?: string;
};

export function TopHeader({
  logo,
  center,
  desktopNav,
  trailing,
  mobilePanel,
  mobilePanelOpen,
  onMobilePanelClose,
  mobileWordmark,
  mobileLeading,
  mobileTrailing,
  mobileToolbarBelow,
  mobileSecondary,
  className,
}: TopHeaderProps) {
  const overlayOpen = Boolean(mobilePanel && mobilePanelOpen);
  const [drawerEntered, setDrawerEntered] = useState(false);

  useEffect(() => {
    if (!overlayOpen) {
      setDrawerEntered(false);
      return;
    }
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDrawerEntered(true);
      return;
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setDrawerEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, [overlayOpen]);

  useEffect(() => {
    if (!overlayOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [overlayOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 max-md:bg-page/80 max-md:backdrop-blur-[6px] max-md:supports-[backdrop-filter]:bg-page/65 md:border-b md:border-border md:bg-white/95 md:backdrop-blur",
        overlayOpen && "max-md:z-[60]",
        className,
      )}
    >
      <div className="md:hidden">
        <MobileTopHeader
          wordmark={mobileWordmark}
          leading={mobileLeading}
          trailing={mobileTrailing}
          toolbarBelow={mobileToolbarBelow}
          secondary={mobileSecondary}
        />
      </div>

      {overlayOpen ? (
        <div
          className="fixed inset-0 z-[100] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="قائمة التنقل"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/45"
            aria-label="إغلاق القائمة"
            onClick={onMobilePanelClose}
          />
          <div
            className={cn(
              "absolute inset-y-0 end-0 z-[101] flex h-dvh min-h-dvh w-[min(20rem,88vw)] max-w-[100vw] flex-col border-s border-border/80 bg-page shadow-2xl motion-reduce:transition-none",
              "pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]",
              "transition-transform duration-200 ease-out motion-reduce:duration-0",
              drawerEntered
                ? "translate-x-0"
                : "ltr:translate-x-full rtl:-translate-x-full",
              "motion-reduce:translate-x-0",
            )}
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3 sm:px-7 sm:py-4">
              {mobilePanel}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto hidden w-full min-w-0 max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8 md:flex">
        <div className="flex min-w-0 shrink-0 items-center gap-2">{logo}</div>
        {center ? (
          <div className="mx-auto hidden min-w-0 max-w-xl flex-1 md:block">
            {center}
          </div>
        ) : null}
        {desktopNav ? (
          <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
            {desktopNav}
          </nav>
        ) : null}
        <div className="ms-auto flex shrink-0 items-center gap-2">{trailing}</div>
      </div>
    </header>
  );
}
