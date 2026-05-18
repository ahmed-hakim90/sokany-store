"use client";

import { Link } from "next-view-transitions";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export type HomeSectionHeaderProps = {
  id?: string;
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  className?: string;
};

/** عنوان قسم الهوم: عنوان و«عرض الكل» في صف واحد (RTL) + وصف فرعي اختياري تحته. */
export function HomeSectionHeader({
  id,
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "عرض الكل",
  className,
}: HomeSectionHeaderProps) {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <div className="flex min-w-0 items-center justify-between gap-3">
        <h2
          id={id}
          className="min-w-0 text-base font-bold tracking-tight text-foreground sm:text-lg md:text-xl"
        >
          {title}
        </h2>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-semibold text-brand-800 underline-offset-4 transition-colors hover:text-brand-950 hover:underline sm:text-xs"
          >
            <span>{viewAllLabel}</span>
            <ChevronLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </Link>
        ) : null}
      </div>
      {subtitle ? (
        <p className="text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
      ) : null}
    </div>
  );
}
