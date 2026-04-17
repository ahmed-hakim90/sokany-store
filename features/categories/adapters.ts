import { stripHtml } from "@/lib/utils";
import { toAbsoluteSiteUrl } from "@/lib/site";
import type { Category, WCCategory } from "@/features/categories/types";

function normalizeCategoryImageSrc(src: string): string {
  const trimmed = src.trim();
  if (!trimmed) return "/images/placeholder.png";
  if (trimmed.startsWith("/")) return trimmed;
  return toAbsoluteSiteUrl(trimmed);
}

export function mapCategory(raw: WCCategory): Category {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: stripHtml(raw.description),
    image: raw.image?.src ? normalizeCategoryImageSrc(raw.image.src) : null,
    count: raw.count,
    parentId: raw.parent,
  };
}

export function mapCategories(raw: WCCategory[]): Category[] {
  return raw.map(mapCategory);
}
