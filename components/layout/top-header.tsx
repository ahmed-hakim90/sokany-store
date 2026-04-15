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
  mobileWordmark: React.ReactNode;
  mobileLeading: React.ReactNode;
  mobileTrailing: React.ReactNode;
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
  mobileWordmark,
  mobileLeading,
  mobileTrailing,
  mobileSecondary,
  className,
}: TopHeaderProps) {
  return (
    <header
      className={cn(
        "z-40 md:sticky md:top-0 md:border-b md:border-border md:bg-white/95 md:backdrop-blur",
        className,
      )}
    >
      <div className="md:hidden">
        <MobileTopHeader
          wordmark={mobileWordmark}
          leading={mobileLeading}
          trailing={mobileTrailing}
          secondary={mobileSecondary}
        />
        {mobilePanel ? (
          <div
            className={cn(
              "border-t border-border/25 bg-page/95 pb-1 backdrop-blur-sm",
              mobilePanelOpen ? "block" : "hidden",
            )}
          >
            <div className="mx-auto max-w-lg px-5 py-2.5 sm:px-7">
              {mobilePanel}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mx-auto hidden max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8 md:flex">
        <div className="flex min-w-0 shrink-0 items-center gap-2">{logo}</div>
        {center ? (
          <div className="mx-auto hidden min-w-0 max-w-xl flex-1 md:block">
            {center}
          </div>
        ) : null}
        {desktopNav ? (
          <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">{desktopNav}</nav>
        ) : null}
        <div className="ms-auto flex shrink-0 items-center gap-2">{trailing}</div>
      </div>
    </header>
  );
}
