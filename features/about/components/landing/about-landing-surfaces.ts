import { commerceLinkClassName } from "@/components/ui/button";
import {
  landingSectionStackClass,
  landingSectionTitleClass,
  surfaceLandingHeroClass,
  surfacePanelClass,
} from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";

export { landingSectionStackClass as aboutLandingSectionStackClass };
export { landingSectionTitleClass as aboutLandingSectionTitleClass };

/** Body copy on white — darker than default muted-foreground (~#808080) for WCAG AA. */
export const aboutLandingBodyClass =
  "text-[15px] leading-relaxed text-brand-950/85 sm:text-base";

/** Section intros and card descriptions. */
export const aboutLandingLeadClass =
  "text-sm leading-relaxed text-brand-950/80 sm:text-[15px]";

/** Accent phrase in headings — readable ink with lime underline (not lime-on-white text). */
export const aboutLandingAccentTextClass =
  "text-brand-900 underline decoration-brand-500 decoration-[0.22em] underline-offset-[0.14em]";

/** Cards on the white About canvas — soft border, light elevation. */
export const aboutLandingPanelClass = cn(
  surfacePanelClass,
  "border-border/80 shadow-[0_10px_32px_-20px_rgba(15,23,42,0.2)]",
);

/** Hero / final CTA section shells on white. */
export const aboutLandingHeroShellClass = surfaceLandingHeroClass;

/** Photo frames on About (story, who we are, final CTA, hero collage). */
export const aboutLandingMediaFrameClass =
  "overflow-hidden rounded-2xl border border-border/80 shadow-[0_12px_36px_-20px_rgba(15,23,42,0.24)]";

/** 2×2 hero collage — breathing room between tiles. */
export const aboutLandingCollageGridClass = "grid grid-cols-2 gap-3 sm:gap-4";

/** Compact 2×2 grids (warranty hero feature cards, etc.). */
export const aboutLandingMiniCardsGridClass = "grid grid-cols-2 gap-3 sm:gap-4";

/** Primary + secondary CTA row — consistent vertical/horizontal gaps. */
export const aboutLandingCtaRowClass =
  "flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4";

const aboutLandingCtaFocusClass =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";

const aboutLandingOutlineCtaBaseClass =
  "inline-flex min-h-12 min-w-[11rem] items-center justify-center gap-2 rounded-full px-8 text-base font-bold transition-[colors,box-shadow,transform] active:scale-[0.98]";

/** Primary CTA — on-brand lime fill (storefront commerce style). */
export const aboutLandingPrimaryCtaClass = cn(
  commerceLinkClassName,
  "font-black shadow-md hover:shadow-lg",
  aboutLandingCtaFocusClass,
);

/** Secondary CTA — outline on white with soft border. */
export const aboutLandingOutlineCtaClass = cn(
  aboutLandingOutlineCtaBaseClass,
  "border border-border/90 bg-white text-brand-950 shadow-sm",
  "hover:border-brand-600/35 hover:bg-surface-muted/50 hover:shadow-md",
  aboutLandingCtaFocusClass,
);

/** CTA on dark overlays (map caption) — solid lime fill for contrast on charcoal. */
export const aboutLandingOverlayCtaClass = cn(
  commerceLinkClassName,
  "mt-4 w-full font-black sm:mt-3 sm:w-auto",
  "focus-visible:outline-white",
);

/** Icon tile on value / trust cards. */
export const aboutLandingIconTileClass =
  "inline-flex items-center justify-center rounded-xl border border-brand-600/25 bg-brand-400/40 text-brand-950";
