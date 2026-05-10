import { test, expect } from "@playwright/test";
import { ROUTES } from "@/lib/constants";

/** معرّف منتج من ‎`mockProducts`‎ — يتجنب إعادة التوجيه من الـ slug إلى الرقم. */
const MOCK_PRODUCT_ID_PATH = "/products/41214";

/**
 * تدخّل تدفق المتسوق: PDP + سلة + بداية الدفع.
 * يُشغَّل مع ‎`NEXT_PUBLIC_USE_MOCK=true`‎ عبر إعداد ‎`webServer`‎ في ‎`playwright.config`‎.
 */
test.describe.configure({ mode: "serial" });

test.describe("storefront commerce smoke", () => {
  test("PDP loads mock product by id", async ({ page }) => {
    await page.goto(MOCK_PRODUCT_ID_PATH);
    const title = page.getByRole("heading", { level: 1 });
    await expect(title).toBeVisible({ timeout: 30_000 });
    await expect(title).toContainText(/خلاط|سوكاني/i);
  });

  test("PDP not-found for unknown slug", async ({ page }) => {
    const res = await page.goto("/products/__no_such_product_slug__", {
      waitUntil: "domcontentloaded",
    });
    expect(res?.status() === 404 || res?.ok() === false).toBeTruthy();
    await expect(
      page.getByRole("heading", { level: 2, name: "الصفحة دي مش موجودة" }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("add to cart and cart page lists product", async ({ page }) => {
    await page.goto(MOCK_PRODUCT_ID_PATH);
    const addBtn = page.getByRole("button", { name: /أضف إلى السلة/i });
    await expect(addBtn).toBeVisible({ timeout: 30_000 });
    await expect(addBtn).toBeEnabled({ timeout: 30_000 });
    await addBtn.click();
    await page.goto(ROUTES.CART);
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.getByText(/خلاط سوكاني/i).first()).toBeVisible();
  });

  test("checkout page shows form after adding line item", async ({ page }) => {
    await page.goto(MOCK_PRODUCT_ID_PATH);
    const addBtn = page.getByRole("button", { name: /أضف إلى السلة/i });
    await expect(addBtn).toBeEnabled({ timeout: 30_000 });
    await addBtn.click();
    await page.goto(ROUTES.CHECKOUT);
    await expect(page.getByRole("heading", { name: "إتمام الطلب" })).toBeVisible();
    await expect(page.getByLabel("الاسم الأول")).toBeVisible();
  });
});
