import { expect, test } from "@playwright/test";

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

const listingResult = {
  isProductPhoto: true,
  title: "Produk contoh untuk kebutuhan harian",
  seoKeywords: ["produk", "contoh", "harian"],
  description: "Produk ini cocok untuk kebutuhan harian dan mudah digunakan.",
  priceEstimate: {
    min: 10_000,
    max: 20_000,
    currency: "IDR",
    confidence: "low",
    rationale: "Estimasi kasar berdasarkan informasi visual yang tersedia.",
  },
  category: {
    marketplace: "general",
    recommended: "Kategori contoh",
    alternatives: [],
  },
  sellingPoints: ["Mudah digunakan", "Cocok untuk harian", "Dapat diedit"],
  warnings: [],
};

async function uploadProduct(page: import("@playwright/test").Page) {
  await page.waitForLoadState("networkidle");
  await page.locator('input[type="file"]').first().setInputFiles({
    name: "product.png",
    mimeType: "image/png",
    buffer: tinyPng,
  });
  await expect(page.getByAltText("Preview foto produk")).toBeVisible();

  const continueButton = page.getByRole("button", {
    name: "Lanjut ke detail",
  });
  if (await continueButton.isVisible()) {
    await continueButton.click();
  }
}

test("completes the mocked listing flow without a paid provider request", async ({
  page,
}) => {
  await page.route("**/api/generate-listing", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, data: listingResult }),
    }),
  );
  await page.goto("/");
  await uploadProduct(page);
  await page.getByRole("button", { name: "Buat draft listing" }).click();

  await expect(
    page.getByRole("heading", { name: "Draft listing", exact: true }),
  ).toBeFocused();
  await expect(page.getByRole("button", { name: "Salin judul" })).toBeVisible();
  await page.getByLabel("Kategori utama").fill("Tas baru");
  await page.getByLabel("Harga minimum (IDR)").fill("15000");
  await expect(page.getByLabel("Kategori utama")).toHaveValue("Tas baru");
});

test("shows a mocked API failure on a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/generate-listing", (route) =>
    route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        error: { code: "RATE_LIMITED", message: "Batas penggunaan tercapai." },
      }),
    }),
  );
  await page.goto("/");
  await uploadProduct(page);
  await page.getByRole("button", { name: "Buat draft listing" }).click();

  await expect(
    page.locator('[role="alert"]').filter({
      hasText: "Batas penggunaan tercapai.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Detail listing", exact: true }),
  ).toBeFocused();
});
