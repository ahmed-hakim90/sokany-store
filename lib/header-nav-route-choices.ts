import { ROUTES } from "@/lib/constants";

/**
 * قيم جاهزة لقائمة المسارات في لوحة التحكم (شريط أيقونات التصنيفات تحت الهيدر).
 * المسار النهائي يُخزَّن كنص — يمكن لاحقاً لصق `/categories/…` مخصص.
 */
export const HEADER_NAV_ROUTE_CHOICES: { value: string; label: string }[] = [
  { value: ROUTES.HOME, label: "الرئيسية" },
  { value: ROUTES.SEARCH, label: "البحث" },
  { value: ROUTES.PRODUCTS, label: "كل المنتجات" },
  { value: ROUTES.CATEGORIES, label: "كل التصنيفات" },
  { value: ROUTES.CART, label: "السلة" },
  { value: ROUTES.ABOUT, label: "من نحن" },
  { value: ROUTES.CONTACT, label: "اتصل بنا" },
  { value: ROUTES.SERVICE_CENTERS, label: "الفروع" },
  { value: ROUTES.RETAILERS, label: "الموزعون" },
  { value: ROUTES.ORDER_TRACKING, label: "تتبع الطلب" },
  { value: ROUTES.WISHLIST, label: "المفضلة" },
  { value: ROUTES.CATEGORY("home-appliances"), label: "تصنيف: الأجهزة المنزلية" },
  { value: ROUTES.CATEGORY("kitchen-supplies"), label: "تصنيف: المطبخ" },
  { value: ROUTES.CATEGORY("personal-care"), label: "تصنيف: العناية الشخصية" },
  { value: ROUTES.CATEGORY("cloth-iron"), label: "تصنيف: مكاوي" },
  { value: ROUTES.CATEGORY("coffee-maker"), label: "تصنيف: القهوة" },
  { value: ROUTES.CATEGORY("spare-parts"), label: "تصنيف: قطع غيار" },
];

export const HEADER_NAV_ROUTE_CUSTOM = "__custom__" as const;
