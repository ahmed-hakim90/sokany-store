"use client";

import { cn } from "@/lib/utils";

export type MobileTopHeaderProps = {
  /** Centered brand mark (typically a short wordmark link). */
  wordmark: React.ReactNode;
  /** Inline-end control (e.g. menu button). */
  trailing: React.ReactNode;
  /** Inline-start control (search icon, back arrow, etc.). */
  leading: React.ReactNode;
  /** Full-width row under the logo row (e.g. product search). */
  toolbarBelow?: React.ReactNode;
  /** Optional muted metadata row under the wordmark. */
  secondary?: React.ReactNode;
  className?: string;
};

/**
 * Minimal mobile storefront header: light chrome, centered wordmark, slim side icons.
 * Compose variants by swapping `leading` (search vs back) and optional `secondary`.
 */
export function MobileTopHeader({
  wordmark,
  trailing,
  leading,
  toolbarBelow,
  secondary,
  className,
}: MobileTopHeaderProps) {
  return (
    <div
      className={cn(
        "border-b border-border/25 bg-accent-900 supports-[backdrop-filter]:bg-page/30",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto grid max-w-lg grid-cols-[minmax(4.5rem,auto)_minmax(0,1fr)_minmax(2.5rem,auto)] items-center gap-x-2 px-2.5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-1 sm:px-7",
        )}
      >
        <div className="flex justify-start [&_button]:-ms-1 [&_a]:-ms-1">
          {leading}
        </div>
        <div className="min-w-0 text-center">{wordmark}</div>
        <div className="flex justify-end [&_button]:-me-1 [&_a]:-me-1">
          {trailing}
        </div>
      </div>
      {toolbarBelow ? (
        <div className="min-w-0 px-2.5 pb-2 pt-0.5 sm:px-7 [&_button]:-me-1">
          {toolbarBelow}
        </div>
      ) : null}
      {secondary ? (
        <div className="text-center">
          <div className="text-[11px] font-medium leading-snug text-muted-foreground sm:text-xs">
            {secondary}
          </div>
        </div>
      ) : null}
    </div>
  );
}
