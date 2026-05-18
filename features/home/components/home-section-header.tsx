"use client";

import { Link } from "next-view-transitions";
import { cn } from "@/lib/utils";

export type HomeSectionHeaderProps = {
  id?: string;
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  className?: string;
};

/** عنوان قسم الهوم: عنوان، وصف فرعي، و«عرض الكل» — محاذاة RTL. */
export function HomeSectionHeader({
  id,
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "عرض الكل",
  className,
}: HomeSectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="min-w-0 text-start">
        <h2
          id={id}
          className="text-base font-bold tracking-tight text-foreground sm:text-lg md:text-xl"
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
        ) : null}
      </div>
      {viewAllHref ? (
        <Link
          href={viewAllHref}
          className="shrink-0 text-xs font-semibold text-brand-800 underline-offset-4 transition-colors hover:text-brand-950 hover:underline sm:text-sm"
        >
          {viewAllLabel}
        </Link>
      ) : null}
    </div>
  );
}
