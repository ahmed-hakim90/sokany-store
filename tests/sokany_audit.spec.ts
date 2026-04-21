import { test, expect, devices } from "@playwright/test";
import { ROUTES } from "@/lib/constants";
import { authorizedRetailers } from "@/features/retailers/data";
import { branchesData } from "@/features/branches/data";
import { aboutContent } from "@/features/about/content";

/**
 * تدقيق واجهة المتجر — عرض iPhone 13 (بدون `...devices['iPhone 13']` كاملاً لأنه يفرض WebKit
 * ولا يعمل مع مشروع chromium/firefox إلا بعد `playwright install webkit`).
 */
const iphone13 = devices["iPhone 13"];

/**
 * تدقيق واجهة المتجر — iPhone 13، محددات متوافقة مع المكوّنات (aria، id، عناوين).
 * يتطلب خادمًا يعمل على baseURL (انظر playwright.config).
 */
test.use({
  viewport: iphone13.viewport,
  userAgent: iphone13.userAgent,
  deviceScaleFactor: iphone13.deviceScaleFactor,
  isMobile: iphone13.isMobile,
  hasTouch: iphone13.hasTouch,
  locale: "ar-EG",
});

/** مطابق لـ `footerLinks` في components/layout/footer.tsx — للتحقق HTTP دون الاعتماد على عرض الشبكة على الموبايل. */
const FOOTER_INTERNAL_PATHS: readonly string[] = [
  ROUTES.HOME,
  ROUTES.PRODUCTS,
  ROUTES.CART,
  ROUTES.CHECKOUT,
  ROUTES.MY_ORDERS,
  ROUTES.ORDER_TRACKING,
  ROUTES.ABOUT,
  ROUTES.SERVICE_CENTERS,
  ROUTES.RETAILERS,
  ROUTES.CONTACT,
  ROUTES.TERMS,
  ROUTES.RETURNS_POLICY,
  ROUTES.WARRANTY,
  ROUTES.PRIVACY,
];

/** مطابق لـ `primaryNavLinks` + `drawerExtraLinks` في components/Navbar.tsx — روابط درج القائمة على الموبايل. */
const MOBILE_DRAWER_INTERNAL_PATHS: readonly string[] = [
  ROUTES.HOME,
  ROUTES.CATEGORY("home-appliances"),
  ROUTES.CATEGORY("kitchen-supplies"),
  ROUTES.CATEGORY("personal-care"),
  ROUTES.PRODUCTS,
  ROUTES.CATEGORIES,
  ROUTES.ORDER_TRACKING,
  ROUTES.ABOUT,
  ROUTES.CONTACT,
  ROUTES.SERVICE_CENTERS,
  ROUTES.RETAILERS,
];

const AUDIT_PAGE_PATHS: readonly string[] = [
  ROUTES.HOME,
  ROUTES.ABOUT,
  ROUTES.RETAILERS,
  ROUTES.ORDER_TRACKING,
  ROUTES.SERVICE_CENTERS,
];

async function expectHttp200(
  request: import("@playwright/test").APIRequestContext,
  path: string,
): Promise<void> {
  const res = await request.get(path);
  expect(res.status(), `مسار ${path}`).toBe(200);
}

async function assertNoHorizontalScroll(page: import("@playwright/test").Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    scrollWidth,
    "سكرول أفقي: عرض المستند أكبر من نافذة العرض",
  ).toBeLessThanOrEqual(clientWidth + 1);
}

test.describe("Sokany storefront audit", () => {
  test("الريسبونسيف: لا سكرول أفقي على الصفحات الرئيسية (iPhone 13)", async ({
    page,
  }) => {
    for (const path of AUDIT_PAGE_PATHS) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await assertNoHorizontalScroll(page);
    }
  });

  test("التنقل: روابط الفوتر ترجع 200", async ({ request }) => {
    for (const path of FOOTER_INTERNAL_PATHS) {
      await expectHttp200(request, path);
    }
  });

  test("التنقل: روابط درج القائمة (نفس مسارات Navbar) ترجع 200", async ({
    request,
  }) => {
    for (const path of MOBILE_DRAWER_INTERNAL_PATHS) {
      await expectHttp200(request, path);
    }
  });

  test("الوظائف: أضف للسلة (عند عرض بطاقات على الصفحة الرئيسية)", async ({
    page,
  }) => {
    await page.goto(ROUTES.HOME, { waitUntil: "domcontentloaded" });
    const addIcon = page.locator('[aria-label="أضف للسلة"]').first();
    if ((await addIcon.count()) === 0) {
      test.skip(true, "لا توجد بطاقة منتج بزر «أضف للسلة» (كتالوج فارغ أو لم يُحمَّل).");
      return;
    }
    await expect(addIcon).toBeVisible({ timeout: 60_000 });
    await addIcon.click();
  });

  test("الوظائف: تتبع الطلب — API + واجهة البحث", async ({ page, request }) => {
    const trackApi = await request.get("/api/orders/track?q=12345");
    expect(trackApi.status()).toBe(200);
    const trackJson = (await trackApi.json()) as { found?: boolean };
    expect(trackJson.found).toBe(true);

    await page.goto(ROUTES.ORDER_TRACKING, { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "تتبع طلبك", level: 1 }),
    ).toBeVisible();
    await expect(page.locator("#track-order-input")).toBeVisible();
    await expect(page.getByRole("button", { name: "تتبع الآن" })).toBeVisible();
  });

  test("البيانات: الموزعون المعتمدون — عناوين من المصدر", async ({ page }) => {
    await page.goto(ROUTES.RETAILERS);
    await expect(
      page.getByRole("heading", {
        name: "المحلات ونقاط البيع المعتمدة",
      }),
    ).toBeVisible();
    for (const r of authorizedRetailers) {
      await expect(page.getByRole("heading", { name: r.name, level: 3 })).toBeVisible();
    }
  });

  test("البيانات: الفروع — بطاقات البيع والصيانة", async ({ page }) => {
    await page.goto(ROUTES.SERVICE_CENTERS);
    await expect(
      page.getByRole("heading", { name: "مراكز الصيانة والفروع", level: 1 }),
    ).toBeVisible();

    for (const b of branchesData.sales) {
      await expect(page.getByRole("heading", { name: b.name, level: 3 })).toBeVisible();
    }
    await expect(
      page.getByRole("heading", { name: "مراكز الصيانة المعتمدة", level: 2 }),
    ).toBeVisible();
    for (const b of branchesData.service) {
      await expect(page.getByRole("heading", { name: b.name, level: 3 })).toBeVisible();
    }
  });

  test("صفحة من نحن: محتوى الهيرو", async ({ page }) => {
    await page.goto(ROUTES.ABOUT);
    await expect(
      page.getByRole("heading", { name: aboutContent.hero.headline }),
    ).toBeVisible();
  });

  test("روابط واتساب تبدأ بـ https://wa.me/ (الفروع + الموزعون)", async ({
    page,
  }) => {
    await page.goto(ROUTES.SERVICE_CENTERS);
    const waBranches = page.locator(
      'a:has-text("واتساب")[href^="https://wa.me/"]',
    );
    expect(await waBranches.count()).toBeGreaterThan(0);

    await page.goto(ROUTES.RETAILERS);
    const waRetail = page.locator('a:has-text("واتساب")');
    const count = await waRetail.count();
    for (let i = 0; i < count; i++) {
      const href = await waRetail.nth(i).getAttribute("href");
      expect(href, `واتساب الموزع ${i}`).toMatch(/^https:\/\/wa\.me\//);
    }
  });
});
