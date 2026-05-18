/** بلاطة فئة مميزة — slug Woo + تسمية عربية ثابتة (الصورة من API فقط). */
export type FeaturedCategoryTileConfig = {
  slug: string;
  label: string;
  /** يُستخدم مع صورة Woo عند التوفّر؛ وإلا تُشتق من `label`. */
  imageAlt?: string;
};

/** بلاطة بعد الدمج مع Woo — `imageSrc` اختياري ولا يأتي من `public/`. */
export type FeaturedCategoryTile = FeaturedCategoryTileConfig & {
  imageSrc?: string;
  /** معرّف Woo عند المطابقة — لروابط `?category=` في الكتالوج. */
  categoryId?: number;
};

/** ثمان فئات مرتبطة بمسارات Woo الفعلية في المتجر. */
export const featuredCategoryTiles: FeaturedCategoryTileConfig[] = [
  { slug: "kitchen-supplies", label: "أجهزة المطبخ", imageAlt: "أجهزة مطبخ سوكاني" },
  { slug: "home-appliances", label: "الأجهزة المنزلية", imageAlt: "أجهزة منزلية سوكاني" },
  { slug: "personal-care", label: "العناية الشخصية", imageAlt: "عناية شخصية سوكاني" },
  { slug: "airfrayer", label: "القلايات", imageAlt: "قلايات هوائية سوكاني" },
  { slug: "blender", label: "الخلاطات", imageAlt: "خلاطات سوكاني" },
  { slug: "electric-cleaner", label: "المكانس", imageAlt: "مكانس كهربائية سوكاني" },
  { slug: "sokany-hair-dryer", label: "فرش الشعر", imageAlt: "أجهزة العناية بالشعر سوكاني" },
  { slug: "microwaves-ovens", label: "الأفران", imageAlt: "أفران وميكروويف سوكاني" },
];
