/** مفاتيح الأيقونات — يجب أن تبقى متوافقة مع `category-icon-registry`. */
export const CATEGORY_ICON_SLUGS = [
  "kitchen-supplies",
  "home-appliances",
  "personal-care",
  "cloth-iron",
  "coffee-maker",
  "spare-parts",
] as const;

export type CategoryIconSlug = (typeof CATEGORY_ICON_SLUGS)[number];
