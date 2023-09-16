import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

// See https://playwright.dev/docs/test-configuration.
const config: PlaywrightTestConfig = {
  testDir: './e2e/specs',
  timeout: 3 * 60 * 1000,
  expect: {
    timeout: 20 * 1000,
  },
  fullyParallel: true,
  outputDir: '../test-results/results',
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI
    ? [['junit', { outputFile: 'results.xml' }], ['html']]
    : [['html', { outputFolder: '../test-results/report' }]],
  globalSetup: require.resolve('./e2e/core/global-setup'),
  use: {
    baseURL: `${process.env.E2E_BASE_URL}/spa/`,
    locale: 'en-US',
    storageState: 'e2e/storageState.json',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
};

export default config;
