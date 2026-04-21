"use client";

import { stickyChromeBottomShadowClass } from "@/components/layout/mobile-commerce-surface";
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

/*
 * موبايل (< lg): شريط بعرض الشاشة تحت الإعلان؛ بدون هامش جانبي ولا فراغ علوي إضافي
 * (`safe-area` على غلاف SiteShell). سطح أبيض متصل مع فاصل سفلي خفيف.
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
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "border-b border-border/70 bg-white px-3 py-2",
          stickyChromeBottomShadowClass,
        )}
      >
        <div
          className={cn(
            "grid min-h-[3.5rem] w-full grid-cols-[minmax(4.5rem,auto)_minmax(0,1fr)_minmax(2.5rem,auto)] items-center gap-x-2",
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
          <div className="min-w-0 pb-1.5 pt-0 [&_button]:-me-1">
            {toolbarBelow}
          </div>
        ) : null}
        {secondary ? (
          <div className="border-t border-border/40 pb-2 pt-1.5 text-center">
            <div className="text-[11px] font-medium leading-snug text-muted-foreground sm:text-xs">
              {secondary}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
