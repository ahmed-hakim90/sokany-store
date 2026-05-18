import { cn } from "@/lib/utils";

/** Elevated panel — drawers, modals, checkout cards */
export const surfacePanelClass =
  "rounded-2xl border border-surface-elevated-border bg-surface-elevated shadow-[var(--surface-elevated-shadow)]";

/** Category tile link — stronger border/focus than default elevated panel (About + categories rail). */
export const categoryTileLinkClass = cn(
  surfacePanelClass,
  "border-2 border-brand-800/28 shadow-[0_10px_28px_-20px_rgba(15,23,42,0.34)]",
  "transition-[transform,box-shadow,border-color] duration-200",
  "hover:-translate-y-0.5 hover:border-brand-800/50 hover:shadow-[var(--surface-elevated-shadow)]",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
);

/** Compact CTA strip — checkout dock, cart footer */
export const surfaceCtaStripClass =
  "border-t border-border/80 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90";

/** Empty / placeholder state shell */
export const surfaceEmptyStateClass =
  "rounded-2xl border border-dashed border-border/90 bg-surface-muted/25 px-4 py-10 text-center sm:px-8 sm:py-14";

/** Primary storefront hero band (legal / static pages) */
export const surfacePageHeroClass =
  "rounded-editorial border border-border/70 bg-gradient-to-br from-white via-white to-brand-50/40 px-5 py-8 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.18)] sm:px-8 sm:py-10";

/*
 * هبوط about/warranty: غلاف هيرو/CTA، عناوين أقسام H2، وتباعد عمودي موحّد.
 */
/** Editorial landing hero / final CTA shell (about, warranty). */
export const surfaceLandingHeroClass =
  "relative overflow-hidden rounded-[1.35rem] border border-border/70 bg-white shadow-[0_16px_48px_-24px_rgba(15,23,42,0.22)]";

/** Section H2 on marketing landings — scales up at sm (matches final CTA). */
export const landingSectionTitleClass =
  "font-display text-2xl font-bold text-brand-950 sm:text-3xl";

/** Default vertical rhythm between landing section blocks. */
export const landingSectionStackClass = "space-y-6";

export function cnSurface(...classes: (string | false | null | undefined)[]) {
  return cn(...classes);
}
