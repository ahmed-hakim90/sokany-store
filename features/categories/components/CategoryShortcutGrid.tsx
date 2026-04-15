import Link from "next/link";
import { AppImage } from "@/components/AppImage";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category } from "@/features/categories/types";

export type CategoryShortcutGridProps = {
  categories: Category[];
  className?: string;
  /** Max tiles to show (home shortcuts). */
  limit?: number;
  /** Home: 3×2 rounded tiles on a soft gray fill (reference layout). */
  layout?: "default" | "home";
};

export function CategoryShortcutGrid({
  categories,
  className,
  limit = 8,
  layout = "default",
}: CategoryShortcutGridProps) {
  const list = categories.slice(0, limit);
  if (list.length === 0) return null;

  const isHome = layout === "home";

  return (
    <div className={cn("w-full", className)}>
      {!isHome ? (
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Browse categories
        </p>
      ) : null}
      <div
        className={cn(
          "grid gap-3",
          isHome ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
        )}
      >
        {list.map((category) => {
          const src = category.image ?? "/images/placeholder.png";
          return (
            <Link key={category.id} href={ROUTES.CATEGORY(category.slug)} className="min-w-0">
              <Card
                variant="surface"
                className={cn(
                  "flex flex-col items-center justify-center text-center transition",
                  isHome
                    ? "aspect-square gap-2 rounded-2xl border-0 bg-[#e4e9ef] p-2 shadow-none hover:bg-[#dce2ea]"
                    : "gap-2 p-3 hover:border-brand-300 hover:shadow-md",
                )}
              >
                <div
                  className={cn(
                    "relative shrink-0 overflow-hidden bg-image-well",
                    isHome
                      ? "h-11 w-11 rounded-xl border border-black/[0.04]"
                      : "h-14 w-14 rounded-full border border-border",
                  )}
                >
                  <AppImage
                    src={src}
                    alt=""
                    fill
                    sizes={isHome ? "44px" : "56px"}
                    className="object-cover"
                  />
                </div>
                <span
                  className={cn(
                    "line-clamp-2 font-semibold text-black",
                    isHome ? "text-[11px] leading-snug" : "text-xs text-foreground",
                  )}
                >
                  {category.name}
                </span>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
