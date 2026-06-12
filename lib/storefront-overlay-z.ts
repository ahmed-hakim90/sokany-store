/**
 * ترتيب طبقات الواجهة — يُحدَّث هنا عند إضافة overlays جديدة.
 * الهيدر sticky: z-50 | أزرار عائمة: 62 | درجات التجارة: 90–100 | بحث ملء الشاشة: 1200 | قائمة موبايل: 140–141
 */
export const STOREFRONT_Z = {
  pwaPrompt: 95,
  drawerOverlay: 90,
  drawerPanel: 100,
  commerceChrome: 60,
  /** أزرار جانبية (صعود لأعلى / سوشيال) — فوق كروم التجارة حتى لا تُختَطَف النقرات. */
  floatingActions: 62,
  stickyBuyBar: 55,
  assistantFab: 54,
  searchOverlay: 1200,
  mobileNav: 140,
  mobileNavPanel: 141,
  checkoutBlocking: 60,
  quickView: 2500,
  product3d: 2600,
} as const;
