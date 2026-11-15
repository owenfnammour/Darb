import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/driving', testMatch: '*.spec.js',
  outputDir: '.tmp/playwright-driving-results', fullyParallel: true, workers: 4,
  use: { baseURL: 'http://127.0.0.1:5177', channel: 'chrome', timezoneId: 'Asia/Beirut', trace: 'retain-on-failure' },
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 5177 --strictPort', url: 'http://127.0.0.1:5177', reuseExistingServer: false },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } },
  ],
})
