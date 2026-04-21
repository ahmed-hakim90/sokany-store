"use client";

import { useEffect, useRef, useState } from "react";
import { AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SocialGlyph } from "@/components/layout/social-glyph";
import { cn } from "@/lib/utils";
import type { SocialLink } from "@/lib/social-links";

export type MobileSocialSpeedDialProps = {
  links: SocialLink[];
};

export function MobileSocialSpeedDial({ links }: MobileSocialSpeedDialProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (links.length === 0) return null;

  return (
    <div
      ref={rootRef}
      className={cn("flex flex-col gap-2 items-end lg:hidden")}
    >
      {open
        ? links.map((s) => (
            <a
              key={s.key}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/80 bg-white text-brand-800 shadow-sm transition-colors hover:bg-surface-muted/80 hover:text-brand-950"
              aria-label={s.label}
              onClick={() => setOpen(false)}
            >
              <SocialGlyph socialKey={s.key} className="h-4 w-4" />
            </a>
          ))
        : null}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="h-11 w-11 min-w-11 shrink-0 rounded-full p-0 shadow-md"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="روابط التواصل الاجتماعي"
        onClick={() => setOpen((v) => !v)}
      >
        <AtSign className="h-5 w-5 shrink-0" aria-hidden />
      </Button>
    </div>
  );
}
