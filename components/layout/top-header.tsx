"use client";

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
  desktopNav,
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
        "sticky top-0 z-40 max-lg:bg-page/80 max-lg:backdrop-blur-[6px] max-lg:supports-[backdrop-filter]:bg-page/65 lg:border-b lg:border-border lg:bg-white/95 lg:backdrop-blur",
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

      <div className="mx-auto hidden min-w-0 max-w-none items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-6 lg:flex lg:gap-5 lg:px-8">
        <div className="flex min-w-0 shrink-0 items-center gap-2">{logo}</div>
        {desktopNav ? (
          <nav className="hidden min-w-0 shrink-0 items-center gap-4 overflow-x-auto overflow-y-hidden whitespace-nowrap text-sm font-medium lg:flex xl:gap-6">
            {desktopNav}
          </nav>
        ) : null}
        {center ? (
          <div className="mx-auto min-w-0 max-w-md flex-1 px-2 lg:max-w-lg">{center}</div>
        ) : null}
        <div className="ms-auto flex shrink-0 items-center gap-2">{trailing}</div>
      </div>
    </header>
  );
}
