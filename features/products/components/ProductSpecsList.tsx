"use client";

import { MobileAccordionSection } from "@/components/ui/mobile-accordion-section";
import { cn } from "@/lib/utils";

export type ProductSpecItem = { label: string; value: string };

export type ProductSpecsListProps = {
  items: ProductSpecItem[];
  className?: string;
  /** Section heading */
  title?: string;
  /** `panel` = always-visible technical block (PDP). `accordion` = collapsible (default). */
  variant?: "accordion" | "panel";
};

function SpecsHeading({ title }: { title: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-brand-900"
        aria-hidden
      >
        <GearIcon />
      </span>
      {title}
    </span>
  );
}

export function ProductSpecsList({
  items,
  className,
  title = "المواصفات والمعلومات",
  variant = "accordion",
}: ProductSpecsListProps) {
  if (items.length === 0) return null;

  const heading = <SpecsHeading title={title} />;

  const body = (
    <dl className="grid min-w-0 gap-2.5 sm:grid-cols-2">
      {items.map((row) => (
        <div
          key={`${row.label}-${row.value}`}
          className="flex min-w-0 flex-col gap-0.5 rounded-xl border border-border bg-white/80 px-3 py-2.5 shadow-[0_1px_0_rgba(15,23,42,0.04)]"
        >
          <dt className="text-xs font-medium text-muted-foreground">{row.label}</dt>
          <dd className="break-words text-sm font-semibold text-foreground">{row.value}</dd>
        </div>
      ))}
    </dl>
  );

  if (variant === "panel") {
    return (
      <section className={cn("min-w-0", className)}>
        <h2 className="mb-3 font-display text-base font-bold text-brand-950">{heading}</h2>
        {body}
      </section>
    );
  }

  return (
    <div className={cn("border-t border-border pt-6", className)}>
      <MobileAccordionSection title={heading} defaultOpen>
        {body}
      </MobileAccordionSection>
    </div>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
