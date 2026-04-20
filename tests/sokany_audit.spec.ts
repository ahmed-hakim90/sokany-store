import { test, expect, devices } from "@playwright/test";
import { ROUTES } from "@/lib/constants";
import { authorizedRetailers } from "@/features/retailers/data";
import { branchesData } from "@/features/branches/data";
import { aboutContent } from "@/features/about/content";
import { mockProducts } from "@/features/products/mock";

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

/** يحدّث حقلاً متحكمًا به في React (مثل `useState` على `<input>`). */
async function setReactInputValue(
  locator: import("@playwright/test").Locator,
  value: string,
) {
  await locator.evaluate((el, v) => {
    const input = el as HTMLInputElement & {
      _valueTracker?: { setValue: (x: string) => void };
    };
    const prev = input.value;
    input.value = v;
    input._valueTracker?.setValue(prev);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
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

  test("الوظائف: أضف إلى السلة من صفحة تفاصيل منتج", async ({ page }) => {
    test.setTimeout(120_000);
    const productId = mockProducts[0]?.id ?? 41214;
    await page.goto(ROUTES.PRODUCT(productId), {
      waitUntil: "domcontentloaded",
    });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 90_000 });
    const addBtn = page.locator('button:has-text("أضف إلى السلة")').first();
    await expect(addBtn).toBeVisible({ timeout: 30_000 });
    await expect(addBtn).toBeEnabled({ timeout: 30_000 });
    await addBtn.click();
  });

  test("الوظائف: تتبع الطلب برقم افتراضي", async ({ page }) => {
    await page.goto(ROUTES.ORDER_TRACKING, { waitUntil: "domcontentloaded" });
    const input = page.locator("#track-order-input");
    await setReactInputValue(input, "12345");
    await expect(input).toHaveValue("12345");
    await expect(page.getByRole("button", { name: "تتبع الآن" })).toBeEnabled({
      timeout: 10_000,
    });
    await page.getByRole("button", { name: "تتبع الآن" }).click();
    await expect(page.getByText("تم استلام الطلب").first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("رقم الطلب").first()).toBeVisible();
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
