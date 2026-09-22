import { expect, test } from "@playwright/test";
import { confirmNextDialog, login } from "./support";

test.describe.serial("admin master data create, edit, delete, validation", () => {
  test("[TC-02] manages fish and production-cost types", async ({ page }) => {
    await login(page);

    await page.goto("/jenis-ikan");
    await page.getByRole("button", { name: "Tambah" }).click();
    await page.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByText("Nama jenis ikan wajib diisi")).toBeVisible();
    await page.getByPlaceholder("Masukkan nama jenis ikan").fill("E2EIKAN");
    await page.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByRole("cell", { name: "E2EIKAN", exact: true })).toBeVisible();
    await confirmNextDialog(page);
    const deleteFish = page.waitForResponse((response) => response.request().method() === "DELETE" && response.url().includes("/api/harvest-types/E2EIKAN"));
    await page.getByRole("button", { name: "Hapus jenis ikan E2EIKAN" }).click();
    await expect((await deleteFish).ok()).toBeTruthy();
    await page.reload();
    await expect(page.getByRole("cell", { name: "E2EIKAN", exact: true })).toHaveCount(0);

    await page.goto("/jenis-pengeluaran");
    await page.getByRole("button", { name: "Tambah" }).click();
    await page.getByPlaceholder("Masukkan nama jenis pengeluaran").fill("E2EBIAYA");
    await page.getByRole("button", { name: "Simpan" }).click();
    await page.getByPlaceholder("Cari...").fill("E2EBIAYA");
    await expect(page.getByRole("cell", { name: "E2EBIAYA", exact: true })).toBeVisible();
    await confirmNextDialog(page);
    const deleteCostType = page.waitForResponse((response) => response.request().method() === "DELETE" && response.url().includes("/api/production-cost-types/E2EBIAYA"));
    await page.getByRole("button", { name: "Hapus jenis pengeluaran E2EBIAYA" }).click();
    await expect((await deleteCostType).ok()).toBeTruthy();
    await page.reload();
    await expect(page.getByRole("cell", { name: "E2EBIAYA", exact: true })).toHaveCount(0);
  });

  test("[TC-01] [TC-02] manages workers, owners, customers, and bagang", async ({ page }) => {
    await login(page);

    await page.goto("/pekerja");
    await page.getByRole("button", { name: "Tambah" }).click();
    await page.getByPlaceholder("Masukkan nama").fill("E2E Pekerja");
    await page.getByRole("button", { name: "Simpan" }).click();
    await page.getByPlaceholder("Cari...").fill("E2E Pekerja");
    await expect(page.getByRole("cell", { name: "E2E Pekerja", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Edit pekerja E2E Pekerja" }).click();
    await page.getByPlaceholder("Masukkan nama").fill("E2E Pekerja Ubah");
    await page.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByRole("cell", { name: "E2E Pekerja Ubah", exact: true })).toBeVisible();
    await confirmNextDialog(page);
    const deleteWorker = page.waitForResponse((response) => response.request().method() === "DELETE" && response.url().includes("/api/workers/"));
    await page.getByRole("button", { name: "Hapus pekerja E2E Pekerja Ubah" }).click();
    await expect((await deleteWorker).ok()).toBeTruthy();
    await page.reload();
    await expect(page.getByRole("cell", { name: "E2E Pekerja Ubah", exact: true })).toHaveCount(0);

    await page.goto("/pemilik");
    await expect(page.getByRole("heading", { name: "Pekerja/Pemilik" })).toBeVisible();

    await page.goto("/pelanggan");
    await page.getByRole("button", { name: "Tambah" }).click();
    await page.getByPlaceholder("Masukkan nama pelanggan").fill("E2E Pelanggan");
    await page.getByRole("button", { name: "Simpan" }).click();
    await page.getByPlaceholder("Cari...").fill("E2E Pelanggan");
    await expect(page.getByRole("cell", { name: "E2E Pelanggan", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Edit pelanggan E2E Pelanggan" }).click();
    await page.getByPlaceholder("Masukkan nama pelanggan").fill("E2E Pelanggan Ubah");
    await page.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByRole("cell", { name: "E2E Pelanggan Ubah", exact: true })).toBeVisible();
    await confirmNextDialog(page);
    const deleteCustomer = page.waitForResponse((response) => response.request().method() === "DELETE" && response.url().includes("/api/customers/"));
    await page.getByRole("button", { name: "Hapus pelanggan E2E Pelanggan Ubah" }).click();
    await expect((await deleteCustomer).ok()).toBeTruthy();
    await page.reload();
    await expect(page.getByRole("cell", { name: "E2E Pelanggan Ubah", exact: true })).toHaveCount(0);

    await page.goto("/bagang");
    await page.getByRole("button", { name: "Tambah Bagang" }).click();
    await page.getByPlaceholder("Masukkan nama bagang").fill("E2E Bagang");
    const selects = page.locator(".modal select");
    await selects.nth(0).selectOption({ label: "Person 1" });
    await selects.nth(1).selectOption({ label: "Person 2" });
    const createBagang = page.waitForResponse((response) => response.request().method() === "POST" && response.url().includes("/api/bagang"));
    await page.getByRole("button", { name: "Simpan" }).click();
    const createdBagang = (await (await createBagang).json()).data;
    await page.getByPlaceholder("Cari...").fill("E2E Bagang");
    const bagangRow = page.getByRole("row").filter({ hasText: "E2E Bagang" });
    await expect(bagangRow).toBeVisible();
    await expect(bagangRow.getByRole("cell", { name: "Person 1" })).toBeVisible();
    await expect(bagangRow.getByRole("cell", { name: "Person 2" })).toBeVisible();

    const detailResponse = await page.request.get(`/api/bagang/${createdBagang.id}`, {
      headers: { Authorization: (await page.evaluate(() => sessionStorage.getItem("catchery.auth.token"))) ?? "" },
    });
    expect(detailResponse.ok()).toBeTruthy();
    const detailData = (await detailResponse.json()).data;
    expect(detailData).toMatchObject({
      name: "E2E Bagang",
      worker_name: "Person 1",
      owner_name: "Person 2",
    });

    await page.getByRole("button", { name: "Edit Bagang E2E Bagang" }).click();
    await page.getByPlaceholder("Masukkan nama bagang").fill("E2E Bagang Ubah");
    await page.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByRole("cell", { name: "E2E Bagang Ubah", exact: true })).toBeVisible();
    await confirmNextDialog(page);
    const deleteBagang = page.waitForResponse((response) => response.request().method() === "DELETE" && response.url().includes("/api/bagang/"));
    await page.getByRole("button", { name: "Hapus Bagang E2E Bagang Ubah" }).click();
    await expect((await deleteBagang).ok()).toBeTruthy();
    await page.reload();
    await expect(page.getByRole("cell", { name: "E2E Bagang Ubah", exact: true })).toHaveCount(0);
  });
});
