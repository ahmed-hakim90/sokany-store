"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const LG_MIN_WIDTH = "(min-width: 1024px)";

export type FooterCollapsibleSectionProps = {
  title: ReactNode;
  children: React.ReactNode;
  /** Extra classes on the summary row (e.g. second heading style on desktop). */
  titleClassName?: string;
  className?: string;
  /** Omit outer border-b on mobile (e.g. last accordion block). */
  noBorder?: boolean;
};

/**
 * max-lg: native disclosure accordion (keyboard + SR-friendly).
 * lg+: forced open via matchMedia; summary styled as a static column heading (no duplicate link trees).
 */
export function FooterCollapsibleSection({
  title,
  children,
  titleClassName,
  className,
  noBorder,
}: FooterCollapsibleSectionProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(LG_MIN_WIDTH);
    const sync = () => {
      const details = detailsRef.current;
      const summary = summaryRef.current;
      if (!details || !summary) return;
      const isLg = mq.matches;
      details.open = isLg;
      if (isLg) {
        summary.tabIndex = -1;
      } else {
        summary.removeAttribute("tabindex");
      }
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <details
      ref={detailsRef}
      className={cn(
        "group border-b border-border/80 last:border-b-0 lg:border-0",
        noBorder && "border-b-0",
        className,
      )}
    >
      <summary
        ref={summaryRef}
        className={cn(
          "flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 py-2.5 text-start font-display text-sm font-semibold text-brand-950",
          "[&::-webkit-details-marker]:hidden",
          "lg:cursor-default lg:pointer-events-none lg:min-h-0 lg:py-0 lg:pb-2 lg:text-lg",
          titleClassName,
        )}
      >
        {title}
        <Chevron className="shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 lg:hidden" />
      </summary>
      <div className="pb-3 lg:pb-0">{children}</div>
    </details>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
