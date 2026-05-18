import { ROUTES } from "@/lib/constants";

/** بلاطات اكتشاف التصنيفات على الهوم — تُطابق أسماء Woo عند توفرها. */
export const HOME_DISCOVERY_TILES = [
  {
    slug: "kitchen-supplies",
    label: "المطبخ",
    fallbackImage: "/images/placeholder.png",
  },
  {
    slug: "coffee-maker",
    label: "الإفطار",
    fallbackImage: "/images/placeholder.png",
  },
  {
    slug: "air-fryer",
    label: "قلايات هوائية",
    fallbackImage: "/images/placeholder.png",
  },
  {
    slug: "blender",
    label: "خلاطات وتجهيز",
    fallbackImage: "/images/placeholder.png",
  },
  {
    slug: "fan",
    label: "مراوح وسخانات",
    fallbackImage: "/images/placeholder.png",
  },
  {
    slug: "water-dispenser",
    label: "موزعات مياه",
    fallbackImage: "/images/placeholder.png",
  },
  {
    slug: "offers",
    label: "العروض",
    hrefOverride: ROUTES.OFFERS,
    fallbackImage: "/images/placeholder.png",
  },
] as const;
