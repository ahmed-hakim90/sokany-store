import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 *
 * خادم الاختبار: ‎`build` + ‎`start` على 3330 (لا يتعارض مع ‎`next dev` على 3000؛ Next يسمح بخادم تطوير واحد فقط لكل مجلد مشروع).
 * لتجاوز التشغيل التلقائي: ‎`PLAYWRIGHT_SKIP_WEBSERVER=1`‎ و ‎`PLAYWRIGHT_TEST_BASE_URL`‎.
 */
const PLAYWRIGHT_PREVIEW_PORT = process.env.PLAYWRIGHT_PREVIEW_PORT?.trim() || '3330';
const DEFAULT_PLAYWRIGHT_ORIGIN =
  process.env.PLAYWRIGHT_TEST_BASE_URL?.trim() ||
  `http://127.0.0.1:${PLAYWRIGHT_PREVIEW_PORT}`;

export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: DEFAULT_PLAYWRIGHT_ORIGIN,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* production preview — يعمل بجانب `next dev` ويضمن ‎`NEXT_PUBLIC_USE_MOCK`‎ لبيانات ثابتة */
  ...(process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? {}
    : {
        webServer: {
          command: `npm run build && ./node_modules/.bin/next start -p ${PLAYWRIGHT_PREVIEW_PORT}`,
          url: DEFAULT_PLAYWRIGHT_ORIGIN,
          reuseExistingServer: !!process.env.PLAYWRIGHT_REUSE_WEBSERVER?.trim(),
          timeout: 360_000,
          env: {
            ...process.env,
            NEXT_PUBLIC_USE_MOCK: 'true',
          },
        },
      }),
});
