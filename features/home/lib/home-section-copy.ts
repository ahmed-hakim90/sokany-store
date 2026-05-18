/** عناوين فرعية ثابتة لأقسام الهوم حسب slug التصنيف الأب. */
export const HOME_PARENT_SECTION_SUBTITLES: Record<string, string> = {
  "kitchen-supplies": "أجهزة المطبخ الأكثر طلباً",
  "home-appliances": "العناية بالمنزل والتنظيف",
  "personal-care": "عناية شخصية يومية",
  coffee: "تجهيز الطعام والقهوة",
  "coffee-maker": "تجهيز الطعام والقهوة",
};

export function homeParentSectionSubtitle(slug: string, fallbackName: string): string {
  return HOME_PARENT_SECTION_SUBTITLES[slug] ?? `منتجات ${fallbackName}`;
}
