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
  /** صف كامل تحت صف الشعار: بحث + شريط التصنيفات — يبقى عند سكرول الإخفاء. */
  toolbarBelow?: React.ReactNode;
  /**
   * مع `toolbarBelow`: `true` يطوي صف الشعار فقط (سكرول للأسفل).
   * `false` أو undefined يُتجاهل إن لم يكن `toolbarBelow`.
   */
  topRowHidden?: boolean;
  /** Optional muted metadata row تحت الـ toolbar. */
  secondary?: React.ReactNode;
  className?: string;
};

const whiteShellHPad =
  "pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))]";

/*
 * موبايل (< lg): `safe-area-inset-top` على `SiteShell`، وهامش أفقي مع safe-area.
 * `topRowHidden` + `toolbarBelow`: ينهار صف الشعار فقط؛ البحث والتصنيفات يبقون.
 */
export function MobileTopHeader({
  wordmark,
  trailing,
  leading,
  toolbarBelow,
  topRowHidden = false,
  secondary,
  className,
}: MobileTopHeaderProps) {
  const logoRow = (
    <div
      className={cn(
        "grid w-full min-h-[3.5rem] grid-cols-[minmax(4.5rem,auto)_minmax(0,1fr)_minmax(2.5rem,auto)] items-center gap-x-2",
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
  );

  if (toolbarBelow) {
    return (
      <div className={cn("w-full", className)}>
        <div
          className={cn(
            "border-b border-border/70 bg-white",
            whiteShellHPad,
            stickyChromeBottomShadowClass,
          )}
        >
          <div
            className={cn(
              "overflow-hidden transition-[max-height] duration-300 ease-out motion-reduce:transition-none",
              topRowHidden
                ? "pointer-events-none max-h-0"
                : "max-h-[5.5rem]",
            )}
          >
            <div className="pt-2">{logoRow}</div>
          </div>
          <div className="min-w-0 px-0 pb-1.5 pt-0 [&_button]:-me-1">
            {toolbarBelow}
          </div>
          {secondary ? (
            <div className="border-t border-border/40 px-0 pb-2 pt-1.5 text-center">
              <div className="text-[11px] font-medium leading-snug text-muted-foreground sm:text-xs">
                {secondary}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "border-b border-border/70 bg-white py-2",
          whiteShellHPad,
          stickyChromeBottomShadowClass,
        )}
      >
        {logoRow}
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
