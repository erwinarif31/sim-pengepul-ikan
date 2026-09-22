import { expect, test } from "@playwright/test";
import { apiFailures, firstDetailUrl, login } from "./support";

test("[TC-10] [TC-13] dashboard and financial report use harvest value as collector capital", async ({ page }) => {
  const failures = apiFailures(page);
  await login(page);
  const metricsResponse = page.waitForResponse((response) => response.url().includes("/api/dashboard/metrics") && response.ok());
  const performanceResponse = page.waitForResponse((response) => response.url().includes("/api/dashboard/bagang-performance") && response.ok());
  await page.reload();
  const metrics = (await (await metricsResponse).json()).data;
  const performance = (await (await performanceResponse).json()).data.data;
  expect(metrics.net_profit).toBe(metrics.total_sales_revenue - metrics.total_harvest_value);
  for (const bagang of performance) {
    expect(bagang.net_profit).toBe(bagang.sales_revenue - bagang.harvest_value);
  }

  await expect(page.locator("select").first()).toHaveValue("1");
  for (const text of ["Nilai Panen", "Biaya Produksi (Pinjaman)", "Total Penjualan", "Laba Bersih", "Tren Nilai Panen", "Panen per Jenis", "Performa Bagang", "Penjualan Terbaru"]) {
    await expect(page.getByText(text, { exact: true }).first()).toBeVisible();
  }

  const reportResponse = page.waitForResponse((response) => response.url().includes("/api/reports/financial") && response.ok());
  await page.goto("/laporan-keuangan");
  const report = (await (await reportResponse).json()).data;
  expect(report.net_profit).toBe(report.total_sales_revenue - report.total_harvest_value);
  await expect(page.getByText("Modal (nilai panen)", { exact: true })).toBeVisible();
  await expect(failures).toEqual([]);
});

test("[TC-10] [TC-11] every permitted app route renders its own content without API failures", async ({ page }) => {
  test.setTimeout(60_000);
  const routes = {
    admin: [["/", "Dashboard"], ["/bagang", "Data Bagang"], ["/musim", "Musim"], ["/jenis-ikan", "Jenis Ikan"], ["/jenis-pengeluaran", "Jenis Pengeluaran"], ["/pekerja", "Pekerja/Pemilik"], ["/pemilik", "Pekerja/Pemilik"], ["/pelanggan", "Pelanggan"], ["/penggajian", "Penggajian"], ["/stok", "Stok"], ["/laporan-keuangan", "Laporan Keuangan"], ["/pembelian/", "Pembelian"], ["/penjualan/", "Penjualan"]],
    owner: [["/", "Dashboard"], ["/bagang", "Data Bagang"], ["/pelanggan", "Pelanggan"], ["/penggajian", "Penggajian"], ["/stok", "Stok"], ["/laporan-keuangan", "Laporan Keuangan"], ["/pembelian/", "Pembelian"], ["/penjualan/", "Penjualan"]],
    worker: [["/", "Dashboard"], ["/bagang", "Data Bagang"], ["/penggajian", "Penggajian"], ["/stok", "Stok"], ["/pembelian/", "Pembelian"], ["/penjualan/", "Penjualan"]],
  } as const;

  for (const [role, paths] of Object.entries(routes) as [keyof typeof routes, readonly (readonly [string, string])[]][]) {
    await login(page, role);
    const failures = apiFailures(page);
    for (const [path, marker] of paths) {
      await page.goto(path);
      await expect.poll(() => page.evaluate(() => location.pathname)).toBe(path);
      await expect(page.getByText(marker, { exact: true }).first()).toBeVisible();
      await expect(page.getByText(/^Memuat/)).toHaveCount(0);
    }
    await expect(failures).toEqual([]);
    await page.getByRole("button", { name: "Keluar" }).click();
  }
});

test("[TC-11] admin dynamic worker, purchase, and sales detail routes load", async ({ page }) => {
  const failures = apiFailures(page);
  await login(page);
  await page.goto("/pekerja");
  const worker = await firstDetailUrl(page, "/pekerja/");
  await page.goto(worker!);
  await expect(page.getByText(/^Detail /)).toBeVisible();

  await page.goto("/pembelian");
  const purchase = await firstDetailUrl(page, "/pembelian/");
  await page.goto(purchase!);
  await expect(page.getByText("Detail Pembelian")).toBeVisible();

  await page.goto("/penjualan");
  const sale = await firstDetailUrl(page, "/penjualan/");
  await page.goto(sale!);
  await expect(page.getByText(/Detail Penjualan #/)).toBeVisible();
  await expect(failures).toEqual([]);
});
