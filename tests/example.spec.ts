import { test, expect, devices } from '@playwright/test';

// 1. إعدادات الموبايل (iPhone 13) لأنها الشاشة الأهم لعملائنا
test.use({ 
  ...devices['iPhone 13'],
  locale: 'ar-EG',
});

test.describe('فحص الشمولية لموقع سوكاني مصر - الوكيل الحصري', () => {

  // --- اختبار الصفحات الثابتة ---
  test('فحص جودة الصفحات التعريفية (About & Branches)', async ({ page }) => {
    // صفحة عن الشركة
    await page.goto('/about');
    await expect(page.locator('h1')).toContainText(/سوكاني/);
    await expect(page.locator('body')).toContainText('الوكيل الحصري');

    // صفحة الفروع
    await page.goto('/branches');
    await expect(page.locator('text=مواعيد العمل')).toBeVisible();
    const whatsappLinks = page.locator('a[href*="wa.me"]');
    expect(await whatsappLinks.count()).toBeGreaterThan(0);
  });

  // --- اختبار صفحة الموزعين ---
  test('فحص شبكة الموزعين المعتمدين', async ({ page }) => {
    await page.goto('/retailers');
    // التأكد من وجود كروت الموزعين (نبحث عن الكلاس اللي استخدمناه)
    const retailerCards = page.locator('.group');
    expect(await retailerCards.count()).toBeGreaterThan(0);
    await expect(page.locator('text=موزع معتمد').first()).toBeVisible();
  });

  // --- اختبار دورة حياة المنتج (إضافة للسلة) ---
  test('فحص إضافة منتج للسلة (UX Check)', async ({ page }) => {
    await page.goto('/'); // الصفحة الرئيسية
    
    // البحث عن أول زر "إضافة" سواء كان أيقونة أو نص
    const addToCartBtn = page.locator('button:has-text("أضف") , button:has(.lucide-shopping-cart), button:has(.lucide-shopping-bag)').first();
    
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
      
      // التأكد من ظهور رسالة نجاح (Toast) أو تحديث عداد السلة
      const cartBadge = page.locator('.cart-badge, .cart-count'); // الكلاسات المحتملة للعداد
      if (await cartBadge.isVisible()) {
        await expect(cartBadge).not.toHaveText('0');
      }
    }
  });

  // --- اختبار تتبع الطلب (Logic Check) ---
  test('فحص محاكي تتبع الطلبات', async ({ page }) => {
    await page.goto('/track-order?q=12345');
    await expect(page.locator('text=تم استلام الطلب')).toBeVisible({ timeout: 15_000 });
  });

  // --- اختبار الروابط المكسورة (Broken Links) ---
  test('فحص وجود أي روابط مكسورة في القائمة الرئيسية', async ({ page }) => {
    await page.goto('/');
    const navLinks = page.locator('nav a');
    const count = await navLinks.count();
    
    for (let i = 0; i < count; i++) {
      const href = await navLinks.nth(i).getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('#')) {
        const response = await page.request.get(href);
        expect(response.status(), `الرابط ${href} مكسور!`).toBe(200);
      }
    }
  });

  // --- اختبار الريسبونسيف (Visual Check) ---
  test('التأكد من عدم وجود تمدد أفقي (No Horizontal Scroll)', async ({ page }) => {
    await page.goto('/');
    const isHorizontalScrollbarVisible = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(isHorizontalScrollbarVisible, 'يوجد مشكلة في الريسبونسيف: السايت بيسحب يمين وشمال!').toBe(false);
  });
});