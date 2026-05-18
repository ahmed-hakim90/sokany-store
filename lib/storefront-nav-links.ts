import { ROUTES } from "@/lib/constants";

/** روابط قليلة تظهر مباشرة في صف الديسكتوب بعد «العروض». */
export const desktopPrimaryBarExtraLinks = [
  { href: ROUTES.CATEGORIES, label: "كل التصنيفات" },
] as const;

/** روابط متجر ثانوية تظهر داخل قائمة «المزيد» في الديسكتوب. */
export const desktopSecondaryNavLinks = [
  { href: ROUTES.ABOUT, label: "من نحن" },
  { href: ROUTES.SERVICE_CENTERS, label: "الفروع" },
  { href: ROUTES.RETAILERS, label: "الموزعون المعتمدون" },
  { href: ROUTES.MY_ORDERS, label: "طلباتي" },
] as const;

/** روابط «خدماتنا» في الديسكتوب، وتُستخدم أيضاً كروابط السياسات في درج الموبايل. */
export const servicesDropdownLinks = [
  { href: ROUTES.CONTACT, label: "تواصل معنا" },
  { href: ROUTES.TERMS, label: "الشروط والأحكام" },
  { href: ROUTES.RETURNS_POLICY, label: "سياسة الاسترجاع والاستبدال" },
  { href: ROUTES.WARRANTY, label: "طرق الاستخدام" },
  { href: ROUTES.PRIVACY, label: "سياسة الخصوصية" },
] as const;

/**
 * أقسام درج القائمة (موبايل) — ترتيب: حساب → دعم → عن المتجر.
 */
export const mobileDrawerLinkSections = [
  {
    title: "حسابي وطلباتي",
    links: [
      { href: ROUTES.ACCOUNT, label: "الحساب" },
      { href: ROUTES.MY_ORDERS, label: "طلباتي" },
      { href: ROUTES.ORDER_TRACKING, label: "تتبع طلب" },
      { href: ROUTES.WISHLIST, label: "المفضلة" },
    ],
  },
  {
    title: "الدعم والفروع",
    links: [
      { href: ROUTES.CONTACT, label: "تواصل معنا" },
      { href: ROUTES.SERVICE_CENTERS, label: "الفروع ومراكز الصيانة" },
      { href: ROUTES.WARRANTY, label: "الضمان وطرق الاستخدام" },
      { href: ROUTES.RETAILERS, label: "الموزعون المعتمدون" },
    ],
  },
  {
    title: "عن المتجر",
    links: [
      { href: ROUTES.HOME, label: "الرئيسية" },
      { href: ROUTES.ABOUT, label: "من نحن" },
      { href: ROUTES.CATEGORIES, label: "كل التصنيفات" },
    ],
  },
] as const;
