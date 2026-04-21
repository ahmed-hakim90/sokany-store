"use client";

import { MobileTopHeader } from "@/components/layout/mobile-top-header";
import { stickyChromeBottomShadowLgClass } from "@/components/layout/mobile-commerce-surface";
import { cn } from "@/lib/utils";

/*
 * الديسكتوب: شريط علوي أبيض مع شريط تصنيفات اختياري.
 * الموبايل: الغلاف شفاف؛ الكبسولة الزجاجية داخل `MobileTopHeader` فقط.
 */

export type TopHeaderProps = {
  logo: React.ReactNode;
  /** e.g. search — optional center slot */
  center?: React.ReactNode;
  /** Full-width row below the top bar (e.g. category strip + mega menu) — `lg` and up only. */
  desktopSubheader?: React.ReactNode;
  /** Desktop header trailing (e.g. cart) */
  trailing: React.ReactNode;
  mobileWordmark: React.ReactNode;
  mobileLeading: React.ReactNode;
  mobileTrailing: React.ReactNode;
  mobileToolbarBelow?: React.ReactNode;
  mobileSecondary?: React.ReactNode;
  /** عند true على الموبايل يُطوى الهيدر العلوي (سكرول للأسفل). */
  mobileChromeCollapsed?: boolean;
  className?: string;
};

export function TopHeader({
  logo,
  center,
  desktopSubheader,
  trailing,
  mobileWordmark,
  mobileLeading,
  mobileTrailing,
  mobileToolbarBelow,
  mobileSecondary,
  mobileChromeCollapsed = false,
  className,
}: TopHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 max-lg:bg-transparent lg:border-b lg:border-border lg:bg-white/95 lg:backdrop-blur",
        stickyChromeBottomShadowLgClass,
        className,
      )}
    >
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-[max-height] duration-300 ease-out motion-reduce:transition-none",
          mobileChromeCollapsed ? "pointer-events-none max-h-0" : "max-h-[100dvh]",
        )}
      >
        <MobileTopHeader
          wordmark={mobileWordmark}
          leading={mobileLeading}
          trailing={mobileTrailing}
          toolbarBelow={mobileToolbarBelow}
          secondary={mobileSecondary}
        />
      </div>

      <div className="mx-auto hidden min-h-[3.5rem] min-w-0 max-w-none items-center gap-3 px-4 py-2 sm:gap-4 sm:px-6 lg:flex lg:gap-5 lg:px-8">
        <div className="flex min-w-0 shrink-0 items-center gap-2">{logo}</div>
        {center ? (
          <div className="mx-auto min-w-0 w-full max-w-md flex-1 px-2 lg:max-w-2xl xl:max-w-3xl">
            {center}
          </div>
        ) : null}
        <div className="ms-auto flex shrink-0 items-center gap-2">{trailing}</div>
      </div>
      {desktopSubheader ? (
        <div className="relative hidden min-w-0 border-t border-border/70 bg-white/98 lg:block">
          {desktopSubheader}
        </div>
      ) : null}
    </header>
  );
}
