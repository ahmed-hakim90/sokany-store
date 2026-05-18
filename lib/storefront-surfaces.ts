import { cn } from "@/lib/utils";

/** Elevated panel — drawers, modals, checkout cards */
export const surfacePanelClass =
  "rounded-2xl border border-surface-elevated-border bg-surface-elevated shadow-[var(--surface-elevated-shadow)]";

/** Compact CTA strip — checkout dock, cart footer */
export const surfaceCtaStripClass =
  "border-t border-border/80 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90";

/** Empty / placeholder state shell */
export const surfaceEmptyStateClass =
  "rounded-2xl border border-dashed border-border/90 bg-surface-muted/25 px-4 py-10 text-center sm:px-8 sm:py-14";

/** Primary storefront hero band (legal / static pages) */
export const surfacePageHeroClass =
  "rounded-editorial border border-border/70 bg-gradient-to-br from-white via-white to-brand-50/40 px-5 py-8 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.18)] sm:px-8 sm:py-10";

export function cnSurface(...classes: (string | false | null | undefined)[]) {
  return cn(...classes);
}
