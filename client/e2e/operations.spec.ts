import { expect, test } from "@playwright/test";
import { confirmNextDialog, firstDetailUrl, login } from "./support";

test.describe.serial("operations preserve stock and payment invariants", () => {
  test("[TC-04] [TC-05] creates, edits, and deletes harvests and production costs", async ({ page }) => {
    await login(page);
    await page.goto("/pembelian");
    const detail = await firstDetailUrl(page, "/pembelian/");
    await page.goto(detail!);

    await page.getByRole("button", { name: "Tambah Panen" }).click();
    await page.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByText("Jenis ikan wajib dipilih")).toBeVisible();
    const harvest = page.locator(".modal");
    await harvest.locator("select").selectOption("Kecil");
    await harvest.locator('input[type="number"]').nth(0).fill("2");
    await harvest.locator('input[type="number"]').nth(1).fill("21000");
    await harvest.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByText("Panen ditambahkan")).toBeVisible();
    const harvestId = await page.getByRole("button", { name: /Edit panen / }).first().getAttribute("aria-label");
    await page.getByRole("button", { name: harvestId! }).click();
    await harvest.locator('input[type="number"]').nth(0).fill("3");
    await harvest.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByText("Panen diubah")).toBeVisible();
    await confirmNextDialog(page);
    await page.getByRole("button", { name: harvestId!.replace("Edit", "Hapus") }).click();
    await expect(page.getByText("Panen dihapus")).toBeVisible();
    await expect(page.getByRole("button", { name: harvestId! })).toHaveCount(0);

    await page.getByRole("button", { name: "Pengeluaran" }).click();
    await page.getByRole("button", { name: "Tambah Pengeluaran" }).click();
    const cost = page.locator(".modal");
    await cost.locator("select").nth(0).selectOption("BBM");
    await cost.locator("select").nth(1).selectOption("both");
    await cost.locator('input[type="number"]').fill("125000");
    await cost.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByText("Pengeluaran ditambahkan")).toBeVisible();
    const costId = await page.getByRole("button", { name: /Edit pengeluaran / }).first().getAttribute("aria-label");
    await page.getByRole("button", { name: costId! }).click();
    await cost.locator('input[type="number"]').fill("130000");
    await cost.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByText("Pengeluaran diubah")).toBeVisible();
    await confirmNextDialog(page);
    await page.getByRole("button", { name: costId!.replace("Edit", "Hapus") }).click();
    await expect(page.getByText("Pengeluaran dihapus")).toBeVisible();
    await expect(page.getByRole("button", { name: costId! })).toHaveCount(0);
  });

  test("[TC-06] [TC-07] [TC-08] sale item changes stock and rejects overselling; payments change paid state", async ({ page }) => {
    await login(page);
    await page.goto("/penjualan");
    await page.getByRole("button", { name: "Tambah Penjualan" }).click();
    const saleModal = page.locator(".modal").filter({ has: page.getByRole("heading", { name: "Buat Penjualan Baru" }) });
    await saleModal.getByRole("button", { name: "+" }).click();
    const customerModal = page.locator(".modal").filter({ has: page.getByRole("heading", { name: "Tambah Pelanggan" }) });
    await customerModal.getByPlaceholder("Masukkan nama pelanggan").fill("E2E Sale Customer");
    await customerModal.getByRole("button", { name: "Simpan" }).click();
    await expect(customerModal).toHaveCount(0);
    await expect(saleModal.getByRole("button", { name: "Simpan" })).toBeEnabled();
    await saleModal.getByRole("button", { name: "Simpan" }).click();
    await page.getByPlaceholder("Cari...").fill("E2E Sale Customer");
    const saleRow = page.getByRole("row").filter({ hasText: "E2E Sale Customer" });
    await expect(saleRow).toBeVisible();
    const sale = await saleRow.locator('a[href^="/penjualan/"]').getAttribute("href");
    await page.goto(sale!);

    const itemSource = await page.evaluate(async () => {
      const response = await fetch("/api/stock/summary?seasonId=1", { headers: { Authorization: sessionStorage.getItem("catchery.auth.token") ?? "" } });
      const body = await response.json();
      return body.data.find((row: { stock_balance_kg: number }) => row.stock_balance_kg >= 3);
    }) as { bagang_id: string; bagang_name: string; harvest_type: string; stock_balance_kg: number } | undefined;
    expect(itemSource).toBeTruthy();
    const stockBalance = () => page.evaluate(async ({ bagangId, harvestType }) => {
      const response = await fetch("/api/stock/summary?seasonId=1", { headers: { Authorization: sessionStorage.getItem("catchery.auth.token") ?? "" } });
      const body = await response.json();
      return body.data.find((row: { bagang_id: string; harvest_type: string }) => row.bagang_id === bagangId && row.harvest_type.toLowerCase() === harvestType.toLowerCase()).stock_balance_kg;
    }, { bagangId: itemSource!.bagang_id, harvestType: itemSource!.harvest_type });

    const saleId = sale!.split("/").pop()!;
    const token = (await page.evaluate(() => sessionStorage.getItem("catchery.auth.token"))) ?? "";

    const invalidFish = await page.request.post(`/api/sales/${saleId}/items`, {
      headers: { Authorization: token },
      data: { bagang_id: itemSource!.bagang_id, harvest_type: "INVALID_FISH", weight: 0.1, price: 10000 },
    });
    expect(invalidFish.status()).toBe(400);

    const invalidWeight = await page.request.post(`/api/sales/${saleId}/items`, {
      headers: { Authorization: token },
      data: { bagang_id: itemSource!.bagang_id, harvest_type: itemSource!.harvest_type, weight: 0.1234, price: 10000 },
    });
    expect(invalidWeight.status()).toBe(400);

    const validDecimal = await page.request.post(`/api/sales/${saleId}/items`, {
      headers: { Authorization: token },
      data: { bagang_id: itemSource!.bagang_id, harvest_type: itemSource!.harvest_type.toUpperCase(), weight: 0.125, price: 10000 },
    });
    expect(validDecimal.ok()).toBeTruthy();
    const addedDetail = ((await validDecimal.json()).data.sales_details as { id: number; weight: number }[]).find((d) => d.weight === 0.125);
    if (addedDetail) {
      await page.request.delete(`/api/sales/items/${addedDetail.id}`, { headers: { Authorization: token } });
    }

    await page.getByRole("button", { name: "Tambah Barang" }).click();
    await page.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByText("Jenis ikan wajib dipilih")).toBeVisible();
    const item = page.locator(".modal");
    await item.locator("select").nth(0).selectOption(itemSource!.harvest_type.replace(/^./, (letter) => letter.toUpperCase()));
    await item.locator('input[type="number"]').nth(0).fill("1");
    await item.locator("select").nth(1).selectOption({ label: itemSource!.bagang_name });
    await item.locator('input[type="number"]').nth(1).fill("20000");
    await item.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByText("Item ditambahkan")).toBeVisible();
    await expect.poll(stockBalance).toBeCloseTo(itemSource!.stock_balance_kg - 1);

    const itemId = await page.getByRole("button", { name: /Edit item / }).getAttribute("aria-label");
    await page.getByRole("button", { name: itemId! }).click();
    await item.locator('input[type="number"]').nth(0).fill("2");
    await item.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByText("Item diubah")).toBeVisible();
    await expect.poll(stockBalance).toBeCloseTo(itemSource!.stock_balance_kg - 2);

    await page.getByRole("button", { name: itemId! }).click();
    await item.locator('input[type="number"]').nth(0).fill(String(itemSource!.stock_balance_kg + 3));
    await item.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByText("insufficient stock for selected bagang and harvest type")).toBeVisible();
    await item.locator('input[type="number"]').nth(0).fill("2");
    await item.getByRole("button", { name: "Simpan" }).click();
    await expect(item).toHaveCount(0);

    await page.getByRole("button", { name: "Tambah Pembayaran" }).click();
    const payment = page.locator(".modal");
    await payment.locator('input[type="number"]').fill("5000");
    await payment.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByText("BELUM LUNAS")).toBeVisible();
    const paymentId = await page.getByRole("button", { name: /Edit pembayaran / }).getAttribute("aria-label");
    await page.getByRole("button", { name: paymentId! }).click();
    await payment.locator('input[type="number"]').fill("40000");
    await payment.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByText("LUNAS")).toBeVisible();
    await confirmNextDialog(page);
    await page.getByRole("button", { name: paymentId!.replace("Edit", "Hapus") }).click();
    await expect(page.getByText("BELUM LUNAS")).toBeVisible();
    await confirmNextDialog(page);
    await page.getByRole("button", { name: itemId!.replace("Edit", "Hapus") }).click();
    await expect(page.getByText("Item dihapus")).toBeVisible();
    await expect.poll(stockBalance).toBeCloseTo(itemSource!.stock_balance_kg);
  });

  test("[TC-12] [TC-13] [TC-14] filters stock and reports with labeled controls", async ({ page }) => {
    await login(page);
    await page.goto("/stok");
    for (const text of ["Stok masuk", "Stok keluar", "Saldo stok"]) {
      await expect(page.getByText(text).first()).toBeVisible();
    }
    await expect(page.getByText("Saldo negatif")).toHaveCount(0);
    await page.getByLabel("Bagang").selectOption({ label: "Bagang 1" });
    await expect(page.getByRole("cell", { name: "Bagang 1", exact: true }).first()).toBeVisible();
    await page.getByLabel("Jenis ikan").selectOption({ label: "Kecil" });
    await expect(page.getByRole("cell", { name: /kecil/i }).first()).toBeVisible();
    await page.getByLabel("Jenis ikan").selectOption("all");
    await page.getByLabel("Tanggal awal").fill("2030-01-01");
    await page.getByLabel("Tanggal akhir").fill("2030-12-31");
    await expect(page.getByText("Tidak ada aktivitas stok untuk filter ini.")).toBeVisible();

    await page.goto("/laporan-keuangan");
    for (const label of [
      "Modal (nilai panen)",
      "Pendapatan penjualan",
      "Total pembayaran",
      "Piutang",
      "Biaya produksi (pinjaman)",
      "Laba bersih",
      "Margin laba",
      "Rincian Penjualan",
      "Rincian Biaya Produksi",
    ]) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    }
    await expect(page.locator("tbody tr").first()).toBeVisible();
    await page.getByLabel("Bagang").selectOption({ label: "Bagang 1" });
    await page.getByLabel("Tanggal awal").fill("2030-01-01");
    await page.getByLabel("Tanggal akhir").fill("2030-12-31");
    await expect(page.getByText("Tidak ada penjualan untuk filter ini.")).toBeVisible();
  });

  test("[TC-09] downloads a season- and bagang-filtered non-empty payroll PDF", async ({ page }) => {
    await login(page);
    await page.goto("/penggajian");
    const row = page.getByRole("row").filter({ hasText: "Person 1" }).filter({ hasText: "Bagang 1" }).first();
    const [download, response] = await Promise.all([
      page.waitForEvent("download"),
      page.waitForResponse((response) => {
        const url = new URL(response.url());
        return response.url().includes("/api/payroll/") && response.status() === 200 &&
          url.searchParams.get("bagangId") !== null && url.searchParams.get("seasonId") === "1";
      }),
      row.getByRole("button", { name: /Cetak PDF/ }).click(),
    ]);
    expect(response.headers()["content-type"]).toContain("application/pdf");
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
    const stream = await download.createReadStream();
    let size = 0;
    for await (const chunk of stream!) size += chunk.length;
    expect(size).toBeGreaterThan(0);
  });
});
