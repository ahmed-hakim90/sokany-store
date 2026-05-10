import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";
import { ROUTES } from "@/lib/constants";

/**
 * فحص ‎a11y‎ أساسي (WCAG 2 A/AA) على مسارات رئيسية.
 * يُكمّل تدقيق يدوي للتباين والتنقّل المعقّد (ميجا مينو).
 */
test.describe("axe accessibility", () => {
  test("home", async ({ page }) => {
    await page.goto(ROUTES.HOME);
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = violations.filter((v) =>
      v.impact === "critical" || v.impact === "serious",
    );
    expect(
      serious,
      serious.map((v) => `${v.id}: ${v.help}`).join("\n"),
    ).toHaveLength(0);
  });

  test("products catalog", async ({ page }) => {
    await page.goto(ROUTES.PRODUCTS);
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = violations.filter((v) =>
      v.impact === "critical" || v.impact === "serious",
    );
    expect(
      serious,
      serious.map((v) => `${v.id}: ${v.help}`).join("\n"),
    ).toHaveLength(0);
  });

  test("mock PDP", async ({ page }) => {
    await page.goto("/products/41214");
    await page.getByRole("heading", { level: 1 }).waitFor({ timeout: 60_000 });
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const serious = violations.filter((v) =>
      v.impact === "critical" || v.impact === "serious",
    );
    expect(
      serious,
      serious.map((v) => `${v.id}: ${v.help}`).join("\n"),
    ).toHaveLength(0);
  });
});
