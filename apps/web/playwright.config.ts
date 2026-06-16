import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {loadEnvFile} from 'node:process';
import {defineConfig, devices} from '@playwright/test';

const e2eEnvPath = resolve(__dirname, 'e2e/.env.e2e.local');
if (existsSync(e2eEnvPath)) {
  loadEnvFile(e2eEnvPath);
}

const webServerCommand = process.env?.['CI'] ? 'npm run start:local' : 'npm run start:stage';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Keep the small suite execution model simple until broader isolation is in place. */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env?.['CI'],
  /* Retry on CI only */
  retries: process.env?.['CI'] ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env?.['CI'] ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    testIdAttribute: 'data-testid',
    baseURL: 'http://localhost:4200',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry'
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']}
    },
    {
      name: 'firefox',
      use: {...devices['Desktop Firefox']}
    },
    {
      name: 'webkit',
      use: {...devices['Desktop Safari']}
    }

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

  /* Run your local dev server before starting the tests */
  webServer: {
    command: webServerCommand,
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env?.["CI"]
  }
});
