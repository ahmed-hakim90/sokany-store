import type {
  FeaturedCategoryTile,
  FeaturedCategoryTileConfig,
} from "@/features/categories/content/featured-category-tiles";
import type { Category } from "@/features/categories/types";

/** لا نعرض صوراً محلية من `public/` كبديل لبلاطات الفئات. */
function categoryTileImageFromApi(category: Category | undefined): string | undefined {
  const src = category?.image?.trim();
  if (!src || src.startsWith("/images/")) return undefined;
  return src;
}

/**
 * يطابق بلاطات الفئات المميزة (slug + نصوص ثابتة) بصور Woo عند توفرها.
 */
export function mergeFeaturedCategoryTilesWithApi(
  tiles: readonly FeaturedCategoryTileConfig[],
  categories: Category[] | undefined,
): FeaturedCategoryTile[] {
  if (!categories?.length) {
    return tiles.map((tile) => ({ ...tile }));
  }

  const bySlug = Object.fromEntries(
    categories.map((category) => [category.slug, category] as const),
  );

  return tiles.map((tile) => {
    const matched = bySlug[tile.slug];
    const imageSrc = categoryTileImageFromApi(matched);
    const imageAlt = tile.imageAlt ?? matched?.name ?? tile.label;

    return {
      ...tile,
      imageAlt,
      ...(matched?.id ? { categoryId: matched.id } : {}),
      ...(imageSrc ? { imageSrc } : {}),
    };
  });
}
