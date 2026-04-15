import { stripHtml } from "@/lib/utils";
import { toAbsoluteSiteUrl } from "@/lib/site";
import type { Category, WCCategory } from "@/features/categories/types";

export function mapCategory(raw: WCCategory): Category {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: stripHtml(raw.description),
    image: raw.image?.src ? toAbsoluteSiteUrl(raw.image.src) : null,
    count: raw.count,
    parentId: raw.parent,
  };
}

export function mapCategories(raw: WCCategory[]): Category[] {
  return raw.map(mapCategory);
}
