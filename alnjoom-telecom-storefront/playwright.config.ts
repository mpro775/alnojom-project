import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    ...devices["Desktop Chrome"],
    channel: "chrome",
  },
  webServer: [
    {
      command: "node tests/e2e/mock-backend.mjs",
      port: 4010,
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: "cross-env BACKEND_API_URL=http://127.0.0.1:4010 NEXT_PUBLIC_APP_URL=http://127.0.0.1:3100 NEXT_PUBLIC_MEDIA_HOST=127.0.0.1 npm run dev -- --hostname 127.0.0.1 --port 3100",
      url: "http://127.0.0.1:3100",
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
