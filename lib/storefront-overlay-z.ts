/**
 * ترتيب طبقات الواجهة — يُحدَّث هنا عند إضافة overlays جديدة.
 * الهيدر sticky: z-50 | درجات التجارة: 90–100 | بحث ملء الشاشة: 1200 | قائمة موبايل: 140–141
 */
export const STOREFRONT_Z = {
  pwaPrompt: 95,
  drawerOverlay: 90,
  drawerPanel: 100,
  commerceChrome: 60,
  stickyBuyBar: 55,
  assistantFab: 54,
  searchOverlay: 1200,
  mobileNav: 140,
  mobileNavPanel: 141,
  checkoutBlocking: 60,
  quickView: 2500,
  product3d: 2600,
} as const;
