import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "e2e-test.spec.ts",
  use: {
    baseURL: "http://localhost:3099",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
