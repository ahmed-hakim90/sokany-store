import type { HomeCategoryTile } from "@/features/home/components/home-category-image-scroller";
import { ROUTES } from "@/lib/constants";

/**
 * Temporary hardcoded list for the home category image scroller.
 *
 * Drop-in replacement when the API is ready: create `useHomeCategoryTiles`
 * (TanStack `useQuery`) under `features/home/hooks/`, return the same
 * `HomeCategoryTile[]` shape, and delete this file.
 *
 * Image assets live under `public/images/categories/` (240×120, 2:1).
 */
export const HOME_CATEGORY_TILES: HomeCategoryTile[] = [
  {
    imageSrc: "/images/categories/01-kitchen.jpg",
    imageAlt: "أجهزة المطبخ",
    href: ROUTES.CATEGORY("kitchen"),
  },
  {
    imageSrc: "/images/categories/02-coffee.jpg",
    imageAlt: "ماكينات القهوة",
    href: ROUTES.CATEGORY("coffee-maker"),
  },
  {
    imageSrc: "/images/categories/03-personal.jpg",
    imageAlt: "العناية الشخصية",
    href: ROUTES.CATEGORY("personal-care"),
  },
];
