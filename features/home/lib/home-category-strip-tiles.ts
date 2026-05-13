import type { Category } from "@/features/categories/types";
import type { HomeCategoryTile } from "@/features/home/components/home-category-image-scroller";
import { parentCategoriesForHome } from "@/features/home/lib/parentCategoriesForHome";
import { ROUTES } from "@/lib/constants";
import type { CmsHomeCategoryScroller } from "@/schemas/cms";

/** قيمة يردّدها ‎`mapCategory` عند نص ‎`src` فارغ — تُعامل مثل «لا صورة». */
const CATEGORY_PLACEHOLDER_SRC = "/images/placeholder.png";

const CATEGORY_PATH_PREFIX = "/categories/";

export function categorySlugFromHomeScrollerHref(href: string): string | null {
  const h = href.trim();
  if (h === ROUTES.CATEGORIES) return null;
  if (!h.startsWith(CATEGORY_PATH_PREFIX) || h.includes("..")) return null;
  const rest = h.slice(CATEGORY_PATH_PREFIX.length).replace(/\/+$/g, "");
  if (!rest || rest.includes("/")) return null;
  try {
    return decodeURIComponent(rest) || null;
  } catch {
    return null;
  }
}

function hasWooCategoryImage(category: Category): category is Category & { image: string } {
  if (category.image == null || !category.image.trim()) return false;
  if (category.image === CATEGORY_PLACEHOLDER_SRC) return false;
  return true;
}

/**
 * سكroller الصفحة الرئيسية تحت الهيرو:
 * - **بدون** لائحة مفعّلة في ‎`site_config`: تصنيفات أب (من الـ API) **التي لها** ‎`image` فقط.
 * - **مع** ‎`enabled` وبلاطات: نفس المجموعة لكن **فقط** التصنيفات المسجّلة، بالترتيب — بلاطة تُلغى إن لم تُعثر على أب/لا يوجد ‎`image` لها في وو.
 */
export function buildHomeCategoryStripTiles(
  allCategories: Category[] | null | undefined,
  scroller: CmsHomeCategoryScroller,
): HomeCategoryTile[] {
  const parents = parentCategoriesForHome(allCategories ?? []);
  const bySlug = new Map(parents.map((c) => [c.slug, c] as const));

  if (scroller.enabled && scroller.items.length > 0) {
    const out: HomeCategoryTile[] = [];
    for (const item of scroller.items) {
      const slug = categorySlugFromHomeScrollerHref(item.href);
      if (slug == null) continue;
      const category = bySlug.get(slug);
      if (!category) continue;
      if (!hasWooCategoryImage(category)) continue;
      out.push({
        imageSrc: category.image,
        imageAlt: (item.imageAlt && item.imageAlt.trim()) || category.name,
        href: item.href.trim() || ROUTES.CATEGORY(slug),
      });
    }
    return out;
  }

  return parents
    .filter(hasWooCategoryImage)
    .map((c) => ({
      imageSrc: c.image,
      imageAlt: c.name,
      href: ROUTES.CATEGORY(c.slug),
    }));
}
