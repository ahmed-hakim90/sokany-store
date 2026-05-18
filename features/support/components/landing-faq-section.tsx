"use client";

import type { ReactNode } from "react";
import { useId, useState } from "react";
import { aboutLandingLeadClass, aboutLandingPanelClass } from "@/features/about/components/landing/about-landing-surfaces";
import { landingSectionStackClass, landingSectionTitleClass } from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";

export type LandingFaqItem = { question: string; answer: string };

export type LandingFaqSectionProps = {
  /** Anchor id for in-page links (e.g. brand-support-grid → /about#faq). */
  sectionId?: string;
  titleId: string;
  title?: string;
  items: readonly LandingFaqItem[];
  footer?: ReactNode;
};

/*
 * أسئلة شائعة — أكورديون مشترك لصفحات about/warranty؛ عمود واحد جوال، عمودان من lg.
 */
export function LandingFaqSection({
  sectionId = "faq",
  titleId,
  title = "الأسئلة الشائعة",
  items,
  footer,
}: LandingFaqSectionProps) {
  const left = items.filter((_, i) => i % 2 === 0);
  const right = items.filter((_, i) => i % 2 === 1);

  return (
    <section id={sectionId} className={landingSectionStackClass} aria-labelledby={titleId}>
      <h2 id={titleId} className={landingSectionTitleClass}>
        {title}
      </h2>
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <FaqColumn items={left} />
        <FaqColumn items={right} />
      </div>
      {footer ? <div className="text-center">{footer}</div> : null}
    </section>
  );
}

function FaqColumn({ items }: { items: readonly LandingFaqItem[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.question}>
          <FaqItem {...item} />
        </li>
      ))}
    </ul>
  );
}

function FaqItem({ question, answer }: LandingFaqItem) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <article className={cn(aboutLandingPanelClass, "overflow-hidden")}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-start font-display text-sm font-semibold text-brand-950 sm:text-[15px]"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{question}</span>
        <Chevron open={open} />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div id={panelId} className="min-h-0 overflow-hidden">
          <p
            className={cn(
              "border-t-2 border-brand-800/18 px-4 pb-4 pt-3",
              aboutLandingLeadClass,
            )}
          >
            {answer}
          </p>
        </div>
      </div>
    </article>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      className={cn(
        "shrink-0 text-brand-900 transition-transform duration-200",
        open && "-rotate-180",
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
