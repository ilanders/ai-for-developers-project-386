import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
  },
  webServer: [
    {
      command: '../backend/gradlew run -p ../backend',
      port: 4010,
      timeout: 120000,
      reuseExistingServer: true,
      cwd: '../backend',
    },
    {
      command: 'npm run dev',
      port: 5173,
      timeout: 30000,
      reuseExistingServer: true,
    },
  ],
})
