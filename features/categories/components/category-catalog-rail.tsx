import type { ReactNode } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/features/categories/category-icon-registry";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category } from "@/features/categories/types";

function AllCategoriesGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="7" height="7" rx="1.25" />
      <rect x="14" y="3" width="7" height="7" rx="1.25" />
      <rect x="3" y="14" width="7" height="7" rx="1.25" />
      <rect x="14" y="14" width="7" height="7" rx="1.25" />
    </svg>
  );
}

type RailTileProps = {
  href: string;
  active: boolean;
  label: string;
  children: ReactNode;
};

function RailTile({ href, active, label, children }: RailTileProps) {
  return (
    <Link href={href} className="block w-full shrink-0">
      <Card
        variant="surface"
        className={cn(
          "flex flex-col items-center gap-1.5 bg-[#e8ecf2] p-1.5 text-center transition",
          active
            ? "border-brand-500 ring-1 ring-brand-500/35"
            : "hover:border-brand-300",
        )}
      >
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-black/[0.06] bg-white text-brand-800 shadow-sm",
            active && "border-brand-400/60",
          )}
        >
          {children}
        </div>
        <span className="line-clamp-2 w-full px-0.5 text-[9px] font-semibold leading-tight text-brand-950">
          {label}
        </span>
      </Card>
    </Link>
  );
}

export type CategoryCatalogRailProps = {
  categories: Category[];
  className?: string;
} & (
  | {
      linkMode: "productsQuery";
      allProductsActive: boolean;
      activeCategoryId?: number;
    }
  | {
      linkMode: "slug";
      activeSlug: string;
    }
);

export function CategoryCatalogRail(props: CategoryCatalogRailProps) {
  const { categories, className } = props;
  if (categories.length === 0) return null;

  const isProducts = props.linkMode === "productsQuery";

  const allActive = isProducts
    ? props.allProductsActive
    : false;

  return (
    <nav
      className={cn(
        "flex w-[4.75rem] shrink-0 flex-col gap-2 overflow-y-auto overscroll-y-contain py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      aria-label="تصفح التصنيفات"
    >
      {isProducts ? (
        <RailTile
          href={ROUTES.PRODUCTS}
          active={allActive}
          label="الكل"
        >
          <AllCategoriesGlyph className="h-6 w-6" />
        </RailTile>
      ) : (
        <RailTile
          href={ROUTES.CATEGORIES}
          active={false}
          label="كل التصنيفات"
        >
          <AllCategoriesGlyph className="h-6 w-6" />
        </RailTile>
      )}
      {categories.map((category) => {
        const href =
          isProducts
            ? `${ROUTES.PRODUCTS}?category=${category.id}`
            : ROUTES.CATEGORY(category.slug);
        const active = isProducts
          ? props.activeCategoryId === category.id
          : props.activeSlug === category.slug;

        return (
          <RailTile key={category.id} href={href} active={active} label={category.name}>
            <CategoryIcon slug={category.slug} className="h-6 w-6" />
          </RailTile>
        );
      })}
    </nav>
  );
}
