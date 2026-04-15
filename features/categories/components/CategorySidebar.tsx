import type { ReactNode } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category } from "@/features/categories/types";

function RowMarker({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "mt-[0.35rem] h-1.5 w-1.5 shrink-0 rounded-full border transition-colors",
        active
          ? "border-brand-500 bg-brand-500"
          : "border-muted-foreground/25 bg-transparent group-hover:border-muted-foreground/45",
      )}
      aria-hidden
    />
  );
}

export type CategorySidebarProps = {
  categories: Category[];
  /** Highlights the active category slug; omit on the all-categories page. */
  activeSlug?: string | null;
  className?: string;
  /** Optional slot below the list (e.g. future filters). */
  footerSlot?: ReactNode;
};

export function CategorySidebar({
  categories,
  activeSlug,
  className,
  footerSlot,
}: CategorySidebarProps) {
  return (
    <nav
      className={cn(
        "rounded-lg border border-border/70 bg-white/85 p-3 backdrop-blur-sm",
        className,
      )}
      aria-label="Category navigation"
    >
      <header className="mb-2 border-b border-border/50 pb-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Categories
        </p>
      </header>
      <ul className="divide-y divide-border/40">
        <li className="py-0.5 first:pt-0">
          <Link
            href={ROUTES.CATEGORIES}
            className={cn(
              "group flex items-start gap-2.5 rounded-md px-1 py-1.5 transition-colors",
              !activeSlug
                ? "bg-brand-500/[0.07]"
                : "hover:bg-black/[0.025]",
            )}
          >
            <RowMarker active={!activeSlug} />
            <span
              className={cn(
                "min-w-0 flex-1 text-sm leading-snug transition-colors",
                !activeSlug
                  ? "font-semibold text-foreground"
                  : "font-medium text-muted-foreground group-hover:text-foreground",
              )}
            >
              All categories
            </span>
          </Link>
        </li>
        {categories.map((category) => {
          const active = activeSlug === category.slug;
          return (
            <li key={category.id} className="py-0.5">
              <Link
                href={ROUTES.CATEGORY(category.slug)}
                className={cn(
                  "group flex items-start gap-2.5 rounded-md px-1 py-1.5 transition-colors",
                  active ? "bg-brand-500/[0.07]" : "hover:bg-black/[0.025]",
                )}
              >
                <RowMarker active={active} />
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "line-clamp-2 text-sm leading-snug transition-colors",
                      active
                        ? "font-semibold text-foreground"
                        : "font-medium text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    {category.name}
                  </span>
                  <span className="mt-0.5 block text-[11px] font-normal leading-tight text-muted-foreground/85">
                    {category.count} products
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {footerSlot ? (
        <div className="mt-3 border-t border-border/50 pt-3 text-sm">{footerSlot}</div>
      ) : null}
    </nav>
  );
}
