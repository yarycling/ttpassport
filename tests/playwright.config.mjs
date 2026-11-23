import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './gui',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: process.env.TTP_BASE_URL || 'http://127.0.0.1:3002',
    browserName: 'chromium',
    headless: true,
    viewport: { width: 1440, height: 960 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  outputDir: './test-results'
});
