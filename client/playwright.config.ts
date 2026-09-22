import { defineConfig, devices } from "@playwright/test";

const isVideoOn = process.env.PW_VIDEO === "on";
const slowMo =
  process.env.PW_SLOW_MO !== undefined
    ? Number(process.env.PW_SLOW_MO)
    : isVideoOn
    ? 500
    : 0;
const video = isVideoOn ? "on" : "retain-on-failure";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: slowMo ? 180_000 : 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:5173",
    launchOptions: { slowMo },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video,
  },
  projects: [
    { name: "chromium", testIgnore: "**/zz-season.spec.ts", use: { ...devices["Desktop Chrome"] } },
    { name: "season", testMatch: "**/zz-season.spec.ts", dependencies: ["chromium"], use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: [
    {
      command: "node scripts/reset-e2e-db.mjs && cd ../apis && DATABASE_NAME=catchery_e2e WEB_PORT=8889 go run cmd/web/main.go",
      url: "http://127.0.0.1:8889/api/users/me",
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        CATCHERY_E2E_RESET: "YES",
        CATCHERY_E2E_DB: "catchery_e2e",
        DATABASE_NAME: "catchery_e2e",
        WEB_PORT: "8889",
      },
    },
    {
      command: "VITE_API_URL=http://127.0.0.1:8889 pnpm run dev -- --host 127.0.0.1 --port 5173",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: false,
      timeout: 30_000,
      env: {
        ...process.env,
        VITE_API_URL: "http://127.0.0.1:8889",
      },
    },
  ],
});
