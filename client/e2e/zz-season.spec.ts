import { expect, test } from "@playwright/test";
import { confirmNextDialog, firstDetailUrl, login } from "./support";

test("[TC-03] admin ends active season and purchase detail filters historical records", async ({ page }) => {
  await login(page);
  await page.goto("/pembelian");
  const detail = await firstDetailUrl(page, "/pembelian/");
  await page.goto(detail!);

  const seasonFilter = page.getByLabel("Filter musim");
  await expect(seasonFilter).toHaveValue(/\d+/);
  const oldSeasonId = await seasonFilter.inputValue();
  const oldHarvest = page.locator('tbody tr:has(button[aria-label^="Edit panen "])').first();
  await expect(oldHarvest).toBeVisible();
  const oldHarvestId = await oldHarvest.getByRole("button", { name: /Edit panen / }).getAttribute("aria-label");

  await page.getByRole("button", { name: "Pengeluaran" }).click();
  const oldCost = page.locator('tbody tr:has(button[aria-label^="Edit pengeluaran "])').first();
  await expect(oldCost).toBeVisible();
  const oldCostId = await oldCost.getByRole("button", { name: /Edit pengeluaran / }).getAttribute("aria-label");

  await page.goto("/musim");
  await expect(page.getByRole("row")).toHaveCount(2);
  await expect(page.getByRole("cell", { name: "-" })).toBeVisible();
  await confirmNextDialog(page);
  await page.getByRole("button", { name: "Akhiri Musim" }).click();
  await expect(page.getByRole("row")).toHaveCount(3);

  await page.goto(detail!);
  await expect(seasonFilter).not.toHaveValue(oldSeasonId);
  await expect(seasonFilter.locator("option:checked")).toHaveText(/Aktif/);
  await expect(page.getByRole("button", { name: oldHarvestId! })).toHaveCount(0);
  await page.getByRole("button", { name: "Pengeluaran" }).click();
  await expect(page.getByRole("button", { name: oldCostId! })).toHaveCount(0);
  await page.getByRole("button", { name: "Hasil Panen" }).click();

  await seasonFilter.selectOption("all");
  await expect(page.getByRole("columnheader", { name: "Musim", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: oldHarvestId! })).toBeVisible();

  await page.getByRole("button", { name: "Pengeluaran" }).click();
  await expect(page.getByRole("columnheader", { name: "Musim", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: oldCostId! })).toBeVisible();
});
