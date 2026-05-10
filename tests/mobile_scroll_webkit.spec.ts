import { test, expect } from "@playwright/test";

/**
 * دخان سريع لمسار السكرول على WebKit + إطار موبايل (يقترب من Safari/iOS).
 * لا يستبدل اختباراً يدوياً على جهاز حقيقي.
 */
test.describe("Mobile storefront scroll (WebKit)", () => {
  test.skip(({ browserName }) => browserName !== "webkit");

  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    locale: "ar-EG",
  });

  test("home page scroll advances after repeated scrollBy", async ({ page }) => {
    await page.goto("/");
    const y0 = await page.evaluate(() => window.scrollY);
    await page.evaluate(() => window.scrollBy(0, 450));
    await page.waitForTimeout(400);
    const y1 = await page.evaluate(() => window.scrollY);
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(400);
    const y2 = await page.evaluate(() => window.scrollY);
    expect(y1).toBeGreaterThan(y0);
    expect(y2).toBeGreaterThan(y1);
  });
});
