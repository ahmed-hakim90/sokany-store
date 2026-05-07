import { test, expect } from "@playwright/test";
import { ROUTES } from "@/lib/constants";

/**
 * فحص خفيف لمهام الـ main thread الطويلة بعد تحميل الصفحة الرئيسية (Chromium فقط — ‎`longtask`‎).
 * عتبات واسعة لتمرير ‎`next dev`‎؛ اضبط ‎`PLAYWRIGHT_TEST_BASE_URL`‎ على ‎`next start`‎ لقياس أقرب للإنتاج.
 */
test("homepage: long-task budget after load", async ({ page, browserName }) => {
  test.skip(
    browserName !== "chromium",
    "PerformanceObserver longtask غير موثوق خارج Chromium",
  );

  await page.goto(ROUTES.HOME, { waitUntil: "domcontentloaded" });

  const { longTaskCount, longTaskDurationMs, longTaskSupported } =
    await page.evaluate(async () => {
      const longTasks: PerformanceEntry[] = [];
      let supported = false;
      await new Promise<void>((resolve) => {
        const po = new PerformanceObserver((list) => {
          longTasks.push(...list.getEntries());
        });
        try {
          po.observe({ entryTypes: ["longtask"] as const });
          supported = true;
        } catch {
          resolve();
          return;
        }
        window.setTimeout(() => {
          po.disconnect();
          resolve();
        }, 6000);
      });
      const duration = longTasks.reduce((s, e) => s + e.duration, 0);
      return {
        longTaskCount: longTasks.length,
        longTaskDurationMs: duration,
        longTaskSupported: supported,
      };
    });

  expect(longTaskSupported, "يجب أن يدعم المتصفح قياس longtask").toBe(true);
  /* عتبات واسعة — الهدف كشف الانحدار الحاد وليس مطابقة Lighthouse */
  expect(longTaskCount).toBeLessThan(220);
  expect(longTaskDurationMs).toBeLessThan(28000);
});
