import Link from "next/link";
import { AppImage } from "@/components/AppImage";
import { ROUTES } from "@/lib/constants";
import type { Category } from "@/features/categories/types";

export function CategoryCard({ category }: { category: Category }) {
  const src = category.image ?? "/images/placeholder.png";
  return (
    <Link
      href={ROUTES.CATEGORY(category.slug)}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-black/[0.06] bg-white shadow-[0_2px_16px_-4px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-6px_rgba(15,23,42,0.1)]"
    >
      <div className="relative aspect-[4/3] w-full bg-image-well">
        <AppImage
          src={src}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="transition group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-brand-600">
          {category.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {category.count}{" "}
          {category.count === 1 ? "منتج" : "منتجات"}
        </p>
      </div>
    </Link>
  );
}
