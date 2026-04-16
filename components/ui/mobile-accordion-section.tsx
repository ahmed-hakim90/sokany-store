"use client";

import type { ReactNode } from "react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export type MobileAccordionSectionProps = {
  title: ReactNode;
  children: React.ReactNode;
  className?: string;
  /** When true, outer border-b is omitted (caller handles dividers). */
  noBorder?: boolean;
  defaultOpen?: boolean;
};

export function MobileAccordionSection({
  title,
  children,
  className,
  noBorder,
  defaultOpen = false,
}: MobileAccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={cn(!noBorder && "border-b border-border/80", className)}>
      <button
        type="button"
        className="flex min-h-11 w-full items-center justify-between gap-2 py-2.5 text-start font-display text-sm font-semibold text-brand-950"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {title}
        <Chevron expanded={open} />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div id={panelId} className="min-h-0 overflow-hidden">
          <div className="pb-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      className={cn(
        "shrink-0 text-muted-foreground transition-transform duration-200",
        expanded && "-rotate-180",
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
