"use client";

import {
  mobileTopHeaderGlassSurfaceClass,
  mobileTopHeaderGlassSurfaceCollapsedClass,
} from "@/components/layout/mobile-commerce-surface";
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
  "pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))]";

/*
 * موبايل (< lg): `safe-area-inset-top` على `SiteShell` — غلاف ‎`TopHeader` موبايل **بدون** خلفية.
 * السطح: ‎`mobileTopHeaderGlassSurfaceClass`‎ (أبيض) / ‎`…CollapsedClass`‎ (ليم عند ‎`topRowHidden`‎) — مثل ‎`MobileCartBottomSheet` + peek.
 * `topRowHidden` + `toolbarBelow`: ينهار صف الشعار فقط؛ البحث والتصنيفات يبقون.
 * صف الشعار: شبكة ‎`auto` | ‎`1fr` | ‎`auto`‎ + حواف داخليّة (بدل هوامس سالبة) لتجنّب قصّ
 * شارة المفضّة أو أرقام الخط الساخن عند حواف الشاشة/‎`overflow-hidden`‎ لطي الصف.
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
        "grid w-full min-h-[3.5rem] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-1.5 px-0.5 min-[400px]:gap-x-2",
      )}
    >
      <div className="flex min-w-0 shrink-0 items-center justify-self-start">
        {leading}
      </div>
      <div className="min-w-0 justify-self-center text-center">{wordmark}</div>
      <div className="flex min-w-0 shrink-0 items-center justify-self-end">
        {trailing}
      </div>
    </div>
  );

  if (toolbarBelow) {
    return (
      <div className={cn("w-full", className)}>
        <div
          className={cn(
            whiteShellHPad,
            topRowHidden
              ? mobileTopHeaderGlassSurfaceCollapsedClass
              : mobileTopHeaderGlassSurfaceClass,
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
            {/*
              ‎`overflow-hidden`‎ لحركة الطي يقصّ ما يخرج عن الصندوق؛ ‎`px-1.5`‎ + ‎`pt-2`‎
              + إزالة الهوامس السالبة في صف الشعار يحافظ على الـ safe-area وشارة المفضّة.
             */}
            <div className="px-1.5 pt-2">{logoRow}</div>
          </div>
          <div className="min-w-0 px-1.5 pb-1.5 pt-0">
            {toolbarBelow}
          </div>
          {secondary ? (
            <div
              className={cn(
                "border-t px-0 pb-2 pt-1.5 text-center",
                topRowHidden ? "border-white/20" : "border-white/25",
              )}
            >
              <div
                className={cn(
                  "text-[11px] font-medium leading-snug sm:text-xs",
                  topRowHidden
                    ? "text-brand-900/85"
                    : "text-muted-foreground",
                )}
              >
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
        className={cn(whiteShellHPad, mobileTopHeaderGlassSurfaceClass, "py-2")}
      >
        <div className="px-1.5">{logoRow}</div>
        {secondary ? (
          <div className="border-t border-white/25 pb-2 pt-1.5 text-center">
            <div className="text-[11px] font-medium leading-snug text-muted-foreground sm:text-xs">
              {secondary}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
