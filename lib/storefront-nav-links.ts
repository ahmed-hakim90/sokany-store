import { ROUTES } from "@/lib/constants";

/** روابط تظهر في صف الديسكتوب بعد «العروض». */
export const desktopPrimaryBarExtraLinks = [
  { href: ROUTES.CATEGORIES, label: "كل التصنيفات" },
  { href: ROUTES.ABOUT, label: "من نحن" },
  { href: ROUTES.SERVICE_CENTERS, label: "الفروع" },
  { href: ROUTES.RETAILERS, label: "الموزعون المعتمدون" },
  { href: ROUTES.MY_ORDERS, label: "طلباتي" },
] as const;

/** باقي الروابط تحت زر «خدماتنا» على الديسكتوب — نفس المسارات في درج الموبايل (قسم سياسات). */
export const servicesDropdownLinks = [
  { href: ROUTES.CONTACT, label: "تواصل معنا" },
  { href: ROUTES.TERMS, label: "الشروط والأحكام" },
  { href: ROUTES.RETURNS_POLICY, label: "سياسة الاسترجاع والاستبدال" },
  { href: ROUTES.WARRANTY, label: "طرق الاستخدام" },
  { href: ROUTES.PRIVACY, label: "سياسة الخصوصية" },
] as const;

const mobileQuickLinks = [
  { href: ROUTES.HOME, label: "الرئيسية" },
  { href: ROUTES.CATEGORIES, label: "كل التصنيفات" },
  { href: ROUTES.PRODUCTS, label: "العروض والمنتجات" },
] as const;

const mobileCategoryShortcuts = [
  { href: ROUTES.CATEGORY("home-appliances"), label: "الأجهزة المنزلية" },
  { href: ROUTES.CATEGORY("kitchen-supplies"), label: "المطبخ" },
  { href: ROUTES.CATEGORY("personal-care"), label: "العناية الشخصية" },
] as const;

const mobileAboutLinks = [
  { href: ROUTES.ABOUT, label: "من نحن" },
  { href: ROUTES.SERVICE_CENTERS, label: "الفروع ومراكز الصيانة" },
  { href: ROUTES.RETAILERS, label: "الموزعون المعتمدون" },
  { href: ROUTES.MY_ORDERS, label: "تتبع الطلب" },
] as const;

/**
 * أقسام القائمة الجانبية للموبايل — البيانات مشتقة من نفس ثوابت المسارات أعلاه حيث يناسب.
 */
export const mobileDrawerLinkSections = [
  { title: "روابط سريعة", links: mobileQuickLinks },
  { title: "تسوق حسب القسم", links: mobileCategoryShortcuts },
  { title: "عن سوكاني", links: mobileAboutLinks },
] as const;

export const mobileDrawerPolicyLinks = servicesDropdownLinks;
