import { cn } from "@/lib/utils";

export type MobileShellProps = {
  /** Optional header row inside the shell */
  top?: React.ReactNode;
  children: React.ReactNode;
  /** Extra bottom padding when a fixed bottom nav is shown */
  bottomNavPadding?: boolean;
  /** Optional floating action (e.g. speed dial) */
  fab?: React.ReactNode;
  className?: string;
};

export function MobileShell({
  top,
  children,
  bottomNavPadding = true,
  fab,
  className,
}: MobileShellProps) {
  return (
    <div className={cn("relative flex min-h-0 min-w-0 flex-1 flex-col", className)}>
      {top}
      <div
        className={cn(
          "min-h-0 flex-1",
          bottomNavPadding &&
            "pb-[var(--mobile-commerce-chrome-height,12rem)] md:pb-0",
        )}
      >
        {children}
      </div>
      {fab ? (
        <div className="pointer-events-none fixed bottom-24 end-4 z-40 md:hidden">
          <div className="pointer-events-auto">{fab}</div>
        </div>
      ) : null}
    </div>
  );
}
