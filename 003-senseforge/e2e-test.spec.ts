import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3099";

test.describe("SenseForge Playground", () => {
  test("1. /playground loads with canvas and code editor", async ({ page }) => {
    await page.goto(`${BASE}/playground`);
    // Canvas area exists
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible({ timeout: 10000 });
    // Code textarea exists
    const textarea = page.locator("textarea");
    await expect(textarea).toBeVisible();
    // Run button exists
    const runBtn = page.getByRole("button", { name: "Run" });
    await expect(runBtn).toBeVisible();
    // Preset buttons exist
    await expect(page.getByRole("button", { name: "Particle Burst" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Flow Field" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Audio Visualizer" })).toBeVisible();
  });

  test("2. Run code → canvas renders (non-blank)", async ({ page }) => {
    await page.goto(`${BASE}/playground`);
    await page.waitForSelector("canvas", { timeout: 10000 });

    // Clear and enter simple code
    const textarea = page.locator("textarea");
    await textarea.fill(`function setup() {
  background('#ff0000');
}
function draw() {
  fill('#00ff00');
  circle(width/2, height/2, 50);
}`);

    // Click Run
    await page.getByRole("button", { name: "Run" }).click();
    // Wait for sandbox to process
    await page.waitForTimeout(1500);

    // Check canvas has non-zero pixels
    const canvas = page.locator("canvas");
    const pixelData = await canvas.evaluate((el: HTMLCanvasElement) => {
      const ctx = el.getContext("2d");
      if (!ctx || el.width === 0 || el.height === 0) return null;
      const data = ctx.getImageData(0, 0, el.width, el.height).data;
      // Check if any non-zero pixel exists
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] > 0 || data[i + 1] > 0 || data[i + 2] > 0) return true;
      }
      return false;
    });
    expect(pixelData).toBe(true);
  });

  test("3. Preset loads code into editor", async ({ page }) => {
    await page.goto(`${BASE}/playground`);
    await page.waitForSelector("textarea", { timeout: 10000 });

    // Click Flow Field preset
    await page.getByRole("button", { name: "Flow Field" }).click();
    const textarea = page.locator("textarea");
    const code = await textarea.inputValue();
    expect(code).toContain("NOISE_SCALE");
    expect(code).toContain("agents");

    // Click Audio Visualizer preset
    await page.getByRole("button", { name: "Audio Visualizer" }).click();
    const code2 = await textarea.inputValue();
    expect(code2).toContain("bars");
    expect(code2).toContain("audio.playTone");
  });

  test("4. Pause and Reset buttons appear when running", async ({ page }) => {
    await page.goto(`${BASE}/playground`);
    await page.waitForSelector("textarea", { timeout: 10000 });

    // Run default code
    await page.getByRole("button", { name: "Run" }).click();
    await page.waitForTimeout(500);

    // Pause button should appear
    const pauseBtn = page.getByRole("button", { name: "Pause" });
    await expect(pauseBtn).toBeVisible({ timeout: 3000 });

    // Click pause
    await pauseBtn.click();
    // Resume button should appear
    await expect(page.getByRole("button", { name: "Resume" })).toBeVisible({ timeout: 3000 });

    // Click reset
    await page.getByRole("button", { name: "Reset" }).click();
    await page.waitForTimeout(300);
    // Pause/Resume should be gone
    await expect(page.getByRole("button", { name: "Pause" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Resume" })).not.toBeVisible();
  });

  test("5. Error code shows error message in console", async ({ page }) => {
    await page.goto(`${BASE}/playground`);
    await page.waitForSelector("textarea", { timeout: 10000 });

    const textarea = page.locator("textarea");
    await textarea.fill(`function setup() {
  thisWillCauseAnError();
}`);

    await page.getByRole("button", { name: "Run" }).click();
    await page.waitForTimeout(1000);

    // Error message should appear in console area
    const errorEl = page.locator(".text-red-400");
    await expect(errorEl).toBeVisible({ timeout: 5000 });
    const errorText = await errorEl.textContent();
    expect(errorText).toContain("Error");
  });
});
