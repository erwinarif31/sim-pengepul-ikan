import { expect, test } from "@playwright/test";
import { apiFailures, apiToken, firstDetailUrl, login, users } from "./support";

type ScopedSale = {
  id: number;
  payments_visible: boolean;
  total_amount: number;
  total_paid: number;
  is_paid_off: boolean;
  sales_details: { id: number; bagang_id: string }[];
  transaction_details?: { id: number; amount: number }[];
};

test("[TC-15] auth validates, persists session, and protects logout history", async ({ page }) => {
  await page.goto("/bagang");
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByText("ID wajib diisi")).toBeVisible();
  await expect(page.getByText("Password wajib diisi")).toBeVisible();

  await page.getByLabel("ID pengguna").fill("admin");
  await page.getByLabel("Password").fill("wrong");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByRole("alert")).toHaveText("ID atau password tidak valid.");

  await page.getByLabel("Password").fill(users.admin.password);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("catchery.auth.token"))).not.toBeNull();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await page.goto("/bagang");
  await expect(page.getByRole("heading", { name: "Data Bagang" })).toBeVisible();

  await page.getByRole("button", { name: "Keluar" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/login$/);
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("catchery.auth.token"))).toBeNull();

  await page.getByLabel("ID pengguna").fill(users.owner.id);
  await page.getByLabel("Password").fill(users.owner.password);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("button", { name: "Keluar" }).click();

  await page.getByLabel("ID pengguna").fill(users.worker.id);
  await page.getByLabel("Password").fill(users.worker.password);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("button", { name: "Keluar" }).click();
});

type PayrollRow = {
  worker_id: string;
  worker_name: string;
  bagang_id: string;
  bagang_name: string;
  season_id: number;
};

test("[TC-09] payroll rows and filters follow role scope", async ({ page, request }) => {
  const getRows = async (token: string) => (await (await request.get("/api/payroll", {
    headers: { Authorization: token },
  })).json()).data as PayrollRow[];
  const adminToken = await apiToken(request, "admin");
  const ownerToken = await apiToken(request, "owner2");
  const workerToken = await apiToken(request, "worker");
  const adminRows = await getRows(adminToken);
  const ownerRows = await getRows(ownerToken);
  const workerRows = await getRows(workerToken);
  const ownerBagangs = (await (await request.get("/api/bagang", { headers: { Authorization: ownerToken } })).json()).data as {
    id: string;
    worker_id: string;
    owner_id: string;
  }[];
  const workerBagangs = (await (await request.get("/api/bagang", { headers: { Authorization: workerToken } })).json()).data as { id: string; worker_id: string }[];
  const adminBagangs = (await (await request.get("/api/bagang", { headers: { Authorization: adminToken } })).json()).data as { id: string }[];

  expect(adminRows.length).toBeGreaterThan(ownerRows.length);
  expect(ownerRows.length).toBeGreaterThan(0);
  expect(workerRows.length).toBeGreaterThan(0);
  expect(ownerRows.every((row) => ownerBagangs.some((bagang) => bagang.id === row.bagang_id))).toBeTruthy();
  expect(workerRows.every((row) => workerBagangs.some((bagang) => bagang.id === row.bagang_id))).toBeTruthy();
  expect(adminRows.every((row) => adminBagangs.some((bagang) => bagang.id === row.bagang_id))).toBeTruthy();
  expect(new Set(ownerRows.map((row) => row.worker_id))).toEqual(new Set([ownerBagangs[0].worker_id, ownerBagangs[0].owner_id]));
  expect(workerRows.every((row) => row.worker_id === workerBagangs[0].worker_id)).toBeTruthy();

  const failures = apiFailures(page);
  await login(page, "owner2");
  await page.goto("/penggajian");
  for (const header of ["Nama", "Bagang", "Musim", "Cetak PDF"]) {
    await expect(page.getByRole("columnheader", { name: header, exact: true })).toBeVisible();
  }
  await expect(page.locator("tbody tr")).toHaveCount(ownerRows.length);
  await expect(page.getByLabel("Filter Nama")).toBeVisible();
  await expect(page.getByLabel("Filter Bagang")).toBeVisible();
  await expect(page.getByLabel("Filter Musim")).toBeVisible();
  await page.getByLabel("Filter Nama").selectOption({ label: ownerRows[0].worker_name });
  await page.getByLabel("Filter Bagang").selectOption(ownerRows[0].bagang_id);
  await page.getByLabel("Filter Musim").selectOption(ownerRows[0].season_id.toString());
  await expect(page.locator("tbody tr")).toHaveCount(1);
  const [download, pdfResponse] = await Promise.all([
    page.waitForEvent("download"),
    page.waitForResponse((response) => {
      const url = new URL(response.url());
      return url.pathname.includes("/api/payroll/") && response.status() === 200 && url.searchParams.get("seasonId") === ownerRows[0].season_id.toString();
    }),
    page.getByRole("button", { name: /Cetak PDF/ }).click(),
  ]);
  expect(pdfResponse.headers()["content-type"]).toContain("application/pdf");
  expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  await expect(failures).toEqual([]);
});

test("[TC-06] [TC-08] [TC-14] [TC-16] [TC-17] sales and payments stay within bagang scope", async ({ page, request }) => {
  await page.goto("/login");
  const adminToken = await apiToken(request, "admin");
  const ownerToken = await apiToken(request, "owner");
  const workerToken = await apiToken(request, "worker");
  const ownerBagangs = (await (await request.get("/api/bagang", { headers: { Authorization: ownerToken } })).json()).data as { id: string }[];
  const workerBagangs = (await (await request.get("/api/bagang", { headers: { Authorization: workerToken } })).json()).data as { id: string }[];
  const ownerIDs = new Set(ownerBagangs.map((bagang) => bagang.id));
  const workerIDs = new Set(workerBagangs.map((bagang) => bagang.id));
  const stock = (await (await request.get("/api/stock/summary?seasonId=1", { headers: { Authorization: adminToken } })).json()).data as {
    bagang_id: string;
    harvest_type: string;
    stock_balance_kg: number;
  }[];
  const ownerSource = stock.find((row) => ownerIDs.has(row.bagang_id) && row.stock_balance_kg >= 1)!;
  expect(ownerSource).toBeTruthy();
  const workerSource = stock.find((row) => workerIDs.has(row.bagang_id) && row.bagang_id !== ownerSource!.bagang_id && row.stock_balance_kg >= 1);
  expect(workerSource).toBeTruthy();

  const createSale = async (customer: string) => {
    const response = await request.post("/api/sales", {
      headers: { Authorization: adminToken },
      data: { customer },
    });
    expect(response.ok()).toBeTruthy();
    return (await response.json()).data as ScopedSale;
  };
  const addItem = async (saleID: number, source: typeof ownerSource, price: number) => {
    const response = await request.post(`/api/sales/${saleID}/items`, {
      headers: { Authorization: adminToken },
      data: { bagang_id: source.bagang_id, harvest_type: source.harvest_type, weight: 1, price },
    });
    expect(response.ok()).toBeTruthy();
    return (await response.json()).data as ScopedSale;
  };

  const mixedSale = await createSale("E2E Scoped Mixed Sale");
  await addItem(mixedSale.id, ownerSource, 10000);
  await addItem(mixedSale.id, workerSource, 30000);
  const paymentResponse = await request.post(`/api/sales/${mixedSale.id}/payments`, {
    headers: { Authorization: adminToken },
    data: { amount: 20000 },
  });
  expect(paymentResponse.ok()).toBeTruthy();

  const adminMixed = (await (await request.get(`/api/sales/${mixedSale.id}`, { headers: { Authorization: adminToken } })).json()).data as ScopedSale;
  const ownerMixed = (await (await request.get(`/api/sales/${mixedSale.id}`, { headers: { Authorization: ownerToken } })).json()).data as ScopedSale;
  const workerMixed = (await (await request.get(`/api/sales/${mixedSale.id}`, { headers: { Authorization: workerToken } })).json()).data as ScopedSale;
  expect(adminMixed).toMatchObject({ total_amount: 40000, total_paid: 20000, payments_visible: true });
  expect(adminMixed.sales_details).toHaveLength(2);
  expect(adminMixed.transaction_details).toHaveLength(1);
  expect(ownerMixed).toMatchObject({ total_amount: 10000, total_paid: 5000, payments_visible: true, is_paid_off: false });
  expect(ownerMixed.sales_details.map((detail) => detail.bagang_id)).toEqual([ownerSource.bagang_id]);
  expect(ownerMixed.transaction_details).toBeUndefined();
  expect(workerMixed).toMatchObject({ total_amount: 30000, total_paid: 15000, payments_visible: true, is_paid_off: false });
  expect(workerMixed.sales_details.map((detail) => detail.bagang_id)).toEqual([workerSource.bagang_id]);
  expect(workerMixed.transaction_details).toBeUndefined();
  expect(ownerMixed.total_paid + workerMixed.total_paid).toBe(adminMixed.total_paid);

  const ownerPaymentResponse = await request.post(`/api/sales/${mixedSale.id}/payments`, {
    headers: { Authorization: ownerToken },
    data: { amount: 1 },
  });
  expect(ownerPaymentResponse.status()).toBe(200);
  const paymentID = adminMixed.transaction_details![0].id;
  expect((await request.put(`/api/sales/payments/${paymentID}`, {
    headers: { Authorization: ownerToken },
    data: { amount: 19000 },
  })).status()).toBe(200);
  expect((await request.delete(`/api/sales/payments/${paymentID}`, {
    headers: { Authorization: ownerToken },
  })).status()).toBe(200);
  expect((await request.post(`/api/sales/${mixedSale.id}/payments`, {
    headers: { Authorization: workerToken },
    data: { amount: 1 },
  })).status()).toBe(403);

  const roundingSale = await createSale("E2E Scoped Rounding Sale");
  await addItem(roundingSale.id, ownerSource, 1);
  await addItem(roundingSale.id, workerSource, 1);
  expect((await request.post(`/api/sales/${roundingSale.id}/payments`, {
    headers: { Authorization: adminToken },
    data: { amount: 1 },
  })).ok()).toBeTruthy();
  const paidScopeToken = ownerSource.bagang_id < workerSource.bagang_id ? ownerToken : workerToken;
  const scopedPaid = (await (await request.get("/api/sales?is_paid_off=true", { headers: { Authorization: paidScopeToken } })).json()).data as ScopedSale[];
  const scopedUnpaid = (await (await request.get("/api/sales?is_paid_off=false", { headers: { Authorization: paidScopeToken } })).json()).data as ScopedSale[];
  expect(scopedPaid.some((sale) => sale.id === roundingSale.id)).toBeTruthy();
  expect(scopedUnpaid.some((sale) => sale.id === roundingSale.id)).toBeFalsy();

  const workerOnlySale = await createSale("E2E Worker Only Sale");
  await addItem(workerOnlySale.id, workerSource, 10000);
  expect((await request.get(`/api/sales/${workerOnlySale.id}`, { headers: { Authorization: ownerToken } })).status()).toBe(404);
  expect((await request.get(`/api/sales/${workerOnlySale.id}`, { headers: { Authorization: workerToken } })).status()).toBe(200);
  expect((await request.post(`/api/sales/${mixedSale.id}/items`, {
    headers: { Authorization: ownerToken },
    data: { bagang_id: ownerSource.bagang_id, harvest_type: ownerSource.harvest_type, weight: 0.1, price: 100 },
  })).status()).toBe(200);
  expect((await request.post(`/api/sales/${workerOnlySale.id}/items`, {
    headers: { Authorization: ownerToken },
    data: { bagang_id: ownerSource.bagang_id, harvest_type: ownerSource.harvest_type, weight: 0.1, price: 100 },
  })).status()).toBe(404);
  expect((await request.post(`/api/sales/${mixedSale.id}/items`, {
    headers: { Authorization: ownerToken },
    data: { bagang_id: workerSource.bagang_id, harvest_type: workerSource.harvest_type, weight: 0.1, price: 100 },
  })).status()).toBe(403);
  expect((await request.post(`/api/sales/${mixedSale.id}/items`, {
    headers: { Authorization: workerToken },
    data: { bagang_id: workerSource.bagang_id, harvest_type: workerSource.harvest_type, weight: 0.1, price: 100 },
  })).status()).toBe(403);
  expect((await request.post(`/api/sales/${workerOnlySale.id}/payments`, {
    headers: { Authorization: ownerToken },
    data: { amount: 1 },
  })).status()).toBe(403);
});

test("[TC-05] [TC-17] production-cost mutations respect role and creator ownership", async ({ page, request }) => {
  const adminToken = await apiToken(request, "admin");
  let ownerToken = await apiToken(request, "owner2");
  let workerToken = await apiToken(request, "worker");
  const ownerID = ((await (await request.get("/api/users/me", { headers: { Authorization: ownerToken } })).json()).data as { worker_id: string }).worker_id;
  const workerID = ((await (await request.get("/api/users/me", { headers: { Authorization: workerToken } })).json()).data as { worker_id: string }).worker_id;
  const bagangResponse = await request.post("/api/bagang", {
    headers: { Authorization: adminToken },
    data: { name: "E2E COST ROLE", is_active: true, worker_id: workerID, owner_id: ownerID },
  });
  expect(bagangResponse.ok()).toBeTruthy();
  const bagangID = (await bagangResponse.json()).data.id as string;

  const createCost = async (token: string, creatorRole: "worker" | "owner" | "both", price: number) => {
    const response = await request.post("/api/production-costs", {
      headers: { Authorization: token },
      data: { bagang_id: bagangID, production_costs_type: "BBM", price, creator_role: creatorRole },
    });
    expect(response.ok()).toBeTruthy();
    return (await response.json()).data.id as string;
  };
  const ownerCostID = await createCost(ownerToken, "owner", 1000);
  const workerCostID = await createCost(adminToken, "worker", 2000);
  const sharedCostID = await createCost(adminToken, "both", 3000);

  await login(page, "owner2");
  await page.goto(`/pembelian/${bagangID}`);
  await page.getByRole("button", { name: "Pengeluaran" }).click();
  await expect(page.getByRole("button", { name: `Edit pengeluaran ${ownerCostID}` })).toBeVisible();
  await expect(page.getByRole("button", { name: `Edit pengeluaran ${sharedCostID}` })).toBeVisible();
  await expect(page.getByRole("button", { name: `Edit pengeluaran ${workerCostID}` })).toHaveCount(0);
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await login(page, "worker");
  await page.goto(`/pembelian/${bagangID}`);
  await page.getByRole("button", { name: "Pengeluaran" }).click();
  await expect(page.getByRole("button", { name: `Edit pengeluaran ${workerCostID}` })).toHaveCount(0);
  await expect(page.getByRole("button", { name: `Edit pengeluaran ${ownerCostID}` })).toHaveCount(0);
  await expect(page.getByRole("button", { name: `Edit pengeluaran ${sharedCostID}` })).toHaveCount(0);
  ownerToken = await apiToken(request, "owner2");
  workerToken = await apiToken(request, "worker");

  expect((await request.put(`/api/production-costs/${workerCostID}`, { headers: { Authorization: ownerToken }, data: { price: 2100 } })).status()).toBe(403);
  expect((await request.delete(`/api/production-costs/${workerCostID}`, { headers: { Authorization: ownerToken } })).status()).toBe(403);
  expect((await request.put(`/api/production-costs/${ownerCostID}`, { headers: { Authorization: workerToken }, data: { price: 1100 } })).status()).toBe(403);
  expect((await request.delete(`/api/production-costs/${ownerCostID}`, { headers: { Authorization: workerToken } })).status()).toBe(403);
  expect((await request.put(`/api/production-costs/${sharedCostID}`, { headers: { Authorization: workerToken }, data: { price: 3100 } })).status()).toBe(403);
  expect((await request.delete(`/api/production-costs/${sharedCostID}`, { headers: { Authorization: workerToken } })).status()).toBe(403);
  expect((await request.put(`/api/production-costs/${ownerCostID}`, { headers: { Authorization: ownerToken }, data: { price: 1100 } })).status()).toBe(200);
  expect((await request.put(`/api/production-costs/${workerCostID}`, { headers: { Authorization: workerToken }, data: { price: 2100 } })).status()).toBe(403);
  expect((await request.put(`/api/production-costs/${sharedCostID}`, { headers: { Authorization: ownerToken }, data: { price: 3100 } })).status()).toBe(200);

  expect((await request.delete(`/api/production-costs/${ownerCostID}`, { headers: { Authorization: ownerToken } })).status()).toBe(200);
  expect((await request.delete(`/api/production-costs/${workerCostID}`, { headers: { Authorization: workerToken } })).status()).toBe(403);
  expect((await request.delete(`/api/production-costs/${workerCostID}`, { headers: { Authorization: adminToken } })).status()).toBe(200);
  expect((await request.delete(`/api/production-costs/${sharedCostID}`, { headers: { Authorization: ownerToken } })).status()).toBe(200);
  expect((await request.delete(`/api/bagang/${bagangID}`, { headers: { Authorization: adminToken } })).status()).toBe(200);
});

test("[TC-10] [TC-11] [TC-16] [TC-18] roles expose permitted navigation, scoped rows, and protected data", async ({ page, request }) => {
  let adminToken = await apiToken(request, "admin");
  const bagangs = await request.get("/api/bagang", { headers: { Authorization: adminToken } });
  expect(bagangs.ok()).toBeTruthy();
  const bagangData = (await bagangs.json()).data as { id: string; name: string }[];
  const ownerBagangId = bagangData.find((bagang) => bagang.name === "Bagang 1")!.id;
  const foreignBagangId = bagangData.find((bagang) => bagang.name === "Bagang 2")!.id;
  const ownerToken = await apiToken(request, "owner");
  const workerToken = await apiToken(request, "worker");
  const ownerBagangResponse = await request.get("/api/bagang", { headers: { Authorization: ownerToken } });
  const workerBagangResponse = await request.get("/api/bagang", { headers: { Authorization: workerToken } });
  const ownerBagangIds = new Set<string>(((await ownerBagangResponse.json()).data as { id: string }[]).map((bagang) => bagang.id));
  const workerBagangIds = new Set<string>(((await workerBagangResponse.json()).data as { id: string }[]).map((bagang) => bagang.id));
  const adminSalesResponse = await request.get("/api/sales", { headers: { Authorization: adminToken } });
  const adminSales = (await adminSalesResponse.json()).data as ScopedSale[];
  const ownerForeignSale = adminSales.find((sale) => sale.sales_details.length > 0 && sale.sales_details.every((detail) => !ownerBagangIds.has(detail.bagang_id)))!;
  const workerForeignSale = adminSales.find((sale) => sale.sales_details.length > 0 && sale.sales_details.every((detail) => !workerBagangIds.has(detail.bagang_id)))!;
  expect(ownerForeignSale).toBeTruthy();
  expect(workerForeignSale).toBeTruthy();

  const ownerSalesResponse = await request.get("/api/sales", { headers: { Authorization: ownerToken } });
  const ownerSales = (await ownerSalesResponse.json()).data as ScopedSale[];
  expect(ownerSales.length).toBeGreaterThan(0);
  expect(ownerSales.every((sale) => sale.payments_visible && sale.sales_details.length > 0 && sale.sales_details.every((detail) => ownerBagangIds.has(detail.bagang_id)) && !sale.transaction_details?.length)).toBeTruthy();
  expect(ownerSales.some((sale) => sale.id === ownerForeignSale.id)).toBeFalsy();
  expect((await request.get(`/api/sales/${ownerForeignSale.id}`, { headers: { Authorization: ownerToken } })).status()).toBe(404);
  expect((await request.post("/api/sales", { headers: { Authorization: ownerToken }, data: { customer: "OWNER FORBIDDEN" } })).status()).toBe(403);

  const workerSalesResponse = await request.get("/api/sales", { headers: { Authorization: workerToken } });
  const workerSales = (await workerSalesResponse.json()).data as ScopedSale[];
  expect(workerSales.length).toBeGreaterThan(0);
  expect(workerSales.every((sale) => sale.payments_visible && sale.sales_details.length > 0 && sale.sales_details.every((detail) => workerBagangIds.has(detail.bagang_id)) && !sale.transaction_details?.length)).toBeTruthy();
  expect(workerSales.some((sale) => sale.id === workerForeignSale.id)).toBeFalsy();
  expect((await request.get(`/api/sales/${workerForeignSale.id}`, { headers: { Authorization: workerToken } })).status()).toBe(404);

  for (const [token, sales] of [[ownerToken, ownerSales], [workerToken, workerSales]] as const) {
    const recentResponse = await request.get("/api/dashboard/recent-sales?seasonId=1&limit=50", { headers: { Authorization: token } });
    expect(recentResponse.ok()).toBeTruthy();
    const recentSales = (await recentResponse.json()).data.data as { id: number; total_amount: number; total_paid: number; is_paid_off: boolean }[];
    const visibleIDs = new Set(sales.map((sale) => sale.id));
    expect(recentSales.every((sale) => visibleIDs.has(sale.id) && sale.is_paid_off === (sale.total_amount > 0 && sale.total_paid >= sale.total_amount))).toBeTruthy();
  }

  const sharedCost = await request.post("/api/production-costs", {
    headers: { Authorization: adminToken },
    data: { bagang_id: ownerBagangId, production_costs_type: "BBM", price: 12345, creator_role: "both" },
  });
  expect(sharedCost.ok()).toBeTruthy();
  const sharedCostId = (await sharedCost.json()).data.id as string;

  await login(page, "admin");
  for (const link of ["Bagang", "Musim", "Pekerja", "Pemilik", "Pelanggan", "Jenis Ikan", "Jenis Pengeluaran"]) {
    await expect(page.getByRole("link", { name: link, exact: true })).toBeVisible();
  }
  await page.getByRole("button", { name: "Keluar" }).click();
  adminToken = await apiToken(request, "admin");

  await login(page, "owner");
  await expect(page.getByRole("link", { name: "Laporan Keuangan" })).toBeVisible();
  for (const link of ["Bagang", "Pelanggan"]) {
    await expect(page.getByRole("link", { name: link, exact: true })).toBeVisible();
  }
  for (const link of ["Musim", "Pekerja", "Pemilik", "Jenis Ikan", "Jenis Pengeluaran"]) {
    await expect(page.getByRole("link", { name: link, exact: true })).toHaveCount(0);
  }
  await page.goto("/musim");
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/jenis-ikan");
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/pelanggan");
  await expect(page).toHaveURL(/\/pelanggan$/);
  await expect(page.getByRole("button", { name: "Tambah", exact: true })).toHaveCount(0);
  await page.goto("/pekerja");
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/bagang");
  await expect(page.getByRole("cell", { name: "Bagang 1", exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Bagang 2", exact: true })).toHaveCount(0);
  await expect(page.evaluate((id) => fetch(`/api/bagang/${id}`, { headers: { Authorization: sessionStorage.getItem("catchery.auth.token") ?? "" } }).then((response) => response.status), foreignBagangId)).resolves.toBe(403);
  await page.goto(`/pembelian/${foreignBagangId}`);
  await expect(page).toHaveURL(/\/pembelian$/);
  await expect(page.getByRole("button", { name: "Tambah Panen" })).toHaveCount(0);
  const ownerPurchase = await firstDetailUrl(page, "/pembelian/");
  await page.goto(ownerPurchase!);
  await page.getByRole("button", { name: "Pengeluaran" }).click();
  await page.getByRole("button", { name: "Tambah Pengeluaran" }).click();
  const ownerCostModal = page.locator(".modal");
  await expect(ownerCostModal.getByRole("option", { name: /Pemilik -/ })).toHaveCount(1);
  await expect(ownerCostModal.getByRole("option", { name: /Umum|Pekerja/ })).toHaveCount(0);
  await ownerCostModal.getByRole("button", { name: "Batal" }).click();
  const sharedCostButton = page.getByRole("button", { name: `Edit pengeluaran ${sharedCostId}` });
  await sharedCostButton.click();
  await expect(ownerCostModal.getByRole("option", { name: /Umum/ })).toHaveCount(1);
  await expect(ownerCostModal.getByRole("option", { name: /Pemilik|Pekerja/ })).toHaveCount(0);
  await ownerCostModal.locator('input[type="number"]').fill("23456");
  await ownerCostModal.getByRole("button", { name: "Simpan" }).click();
  await expect(ownerCostModal).toHaveCount(0);
  const persistedCosts = await request.get(`/api/bagang/${ownerBagangId}/production-costs`, {
    headers: { Authorization: adminToken },
  });
  expect(persistedCosts.ok()).toBeTruthy();
  const persistedSharedCost = (await persistedCosts.json()).data.find(
    (cost: { id: string }) => cost.id === sharedCostId,
  );
  expect(persistedSharedCost).toMatchObject({ creator_role: "both", price: 23456 });
  const deletedSharedCost = await request.delete(`/api/production-costs/${sharedCostId}`, {
    headers: { Authorization: adminToken },
  });
  expect(deletedSharedCost.ok()).toBeTruthy();
  await page.goto("/penggajian");
  await expect(page.getByRole("columnheader", { name: "Nama", exact: true })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Bagang", exact: true })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Musim", exact: true })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Cetak PDF", exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Person 1", exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Person 2", exact: true })).toHaveCount(0);
  await expect(page.getByRole("cell", { name: "Bagang 1", exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Bagang 2", exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Filter Nama")).toBeVisible();
  await expect(page.getByLabel("Filter Bagang")).toBeVisible();
  await expect(page.getByLabel("Filter Musim")).toBeVisible();
  await page.goto("/penjualan");
  await expect(page.getByRole("button", { name: "Tambah Penjualan" })).toHaveCount(0);
  await expect(page.getByRole("row")).toHaveCount(Math.min(ownerSales.length, 50) + 1);
  const ownerSale = await firstDetailUrl(page, "/penjualan/");
  await page.goto(ownerSale!);
  await expect(page.getByText("Dikelola Admin")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Riwayat Pembayaran" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tambah Pembayaran" })).toBeVisible();

  await page.getByRole("button", { name: "Keluar" }).click();
  await login(page, "worker");
  await expect(page.getByRole("link", { name: "Laporan Keuangan" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Bagang", exact: true })).toBeVisible();
  for (const link of ["Musim", "Pekerja", "Pemilik", "Pelanggan", "Jenis Ikan", "Jenis Pengeluaran"]) {
    await expect(page.getByRole("link", { name: link, exact: true })).toHaveCount(0);
  }
  for (const path of ["/musim", "/pelanggan", "/jenis-pengeluaran"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/$/);
  }
  await expect(page.getByRole("button", { name: "Tambah Penjualan" })).toHaveCount(0);
  await page.goto("/laporan-keuangan");
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/bagang");
  await expect(page.getByRole("cell", { name: "Bagang 3", exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Bagang 2", exact: true })).toHaveCount(0);
  await expect(page.evaluate((id) => fetch(`/api/bagang/${id}`, { headers: { Authorization: sessionStorage.getItem("catchery.auth.token") ?? "" } }).then((response) => response.status), foreignBagangId)).resolves.toBe(403);
  await page.goto("/penggajian");
  await expect(page.getByRole("columnheader", { name: "Nama", exact: true })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Bagang", exact: true })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Musim", exact: true })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Cetak PDF", exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Person 3", exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Person 1", exact: true })).toHaveCount(0);
  await expect(page.getByRole("cell", { name: "Bagang 3", exact: true })).toBeVisible();
  await expect(page.getByLabel("Filter Nama")).toBeVisible();
  await expect(page.getByLabel("Filter Bagang")).toBeVisible();
  await expect(page.getByLabel("Filter Musim")).toBeVisible();
  await page.goto("/penjualan");
  await expect(page.getByRole("row")).toHaveCount(Math.min(workerSales.length, 50) + 1);
  const workerSale = await firstDetailUrl(page, "/penjualan/");
  await page.goto(workerSale!);
  await expect(page.getByText("Dikelola Admin")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Riwayat Pembayaran" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Tambah Pembayaran" })).toHaveCount(0);
});

test("[TC-17] [TC-18] backend enforces direct and foreign role boundaries", async ({ page, request }) => {
  const adminToken = await apiToken(request, "admin");
  const ownerToken = await apiToken(request, "owner");
  const workerToken = await apiToken(request, "worker");
  const adminBagangs = (await (await request.get("/api/bagang", { headers: { Authorization: adminToken } })).json()).data as {
    id: string;
    worker_id: string;
    owner_id: string;
  }[];
  const ownerBagangs = (await (await request.get("/api/bagang", { headers: { Authorization: ownerToken } })).json()).data as typeof adminBagangs;
  const workerBagangs = (await (await request.get("/api/bagang", { headers: { Authorization: workerToken } })).json()).data as typeof adminBagangs;
  const ownerIDs = new Set(ownerBagangs.map((bagang) => bagang.id));
  const foreignOwnerBagang = adminBagangs.find((bagang) => !ownerIDs.has(bagang.id))!;
  const workerBagang = workerBagangs[0];
  expect(foreignOwnerBagang).toBeTruthy();
  expect(workerBagang).toBeTruthy();

  const foreignHarvests = (await (await request.get(`/api/bagang/${foreignOwnerBagang.id}/harvests`, { headers: { Authorization: adminToken } })).json()).data as { id: string }[];
  const foreignCosts = (await (await request.get(`/api/bagang/${foreignOwnerBagang.id}/production-costs`, { headers: { Authorization: adminToken } })).json()).data as { id: string }[];
  const workerHarvests = (await (await request.get(`/api/bagang/${workerBagang.id}/harvests`, { headers: { Authorization: adminToken } })).json()).data as { id: string }[];
  const workerCosts = (await (await request.get(`/api/bagang/${workerBagang.id}/production-costs`, { headers: { Authorization: adminToken } })).json()).data as { id: string }[];
  expect(foreignHarvests.length).toBeGreaterThan(0);
  expect(foreignCosts.length).toBeGreaterThan(0);
  expect(workerHarvests.length).toBeGreaterThan(0);
  expect(workerCosts.length).toBeGreaterThan(0);

  expect((await request.put(`/api/bagang/${foreignOwnerBagang.id}`, { headers: { Authorization: ownerToken }, data: {} })).status()).toBe(403);
  expect((await request.delete(`/api/bagang/${foreignOwnerBagang.id}`, { headers: { Authorization: ownerToken } })).status()).toBe(403);
  expect((await request.put(`/api/bagang/${ownerBagangs[0].id}`, { headers: { Authorization: ownerToken }, data: { owner_id: foreignOwnerBagang.owner_id } })).status()).toBe(403);
  expect((await request.post("/api/bagang", {
    headers: { Authorization: ownerToken },
    data: { name: "E2E FORBIDDEN", is_active: true, worker_id: workerBagang.worker_id, owner_id: foreignOwnerBagang.owner_id },
  })).status()).toBe(403);
  expect((await request.put(`/api/bagang/${workerBagang.id}`, { headers: { Authorization: workerToken }, data: {} })).status()).toBe(403);
  expect((await request.delete(`/api/bagang/${workerBagang.id}`, { headers: { Authorization: workerToken } })).status()).toBe(403);

  expect((await request.get(`/api/bagang/${foreignOwnerBagang.id}/harvests`, { headers: { Authorization: ownerToken } })).status()).toBe(403);
  expect((await request.put(`/api/harvests/${foreignHarvests[0].id}`, { headers: { Authorization: ownerToken }, data: {} })).status()).toBe(403);
  expect((await request.put(`/api/harvests/${workerHarvests[0].id}`, { headers: { Authorization: workerToken }, data: {} })).status()).toBe(403);
  expect((await request.delete(`/api/harvests/${workerHarvests[0].id}`, { headers: { Authorization: workerToken } })).status()).toBe(403);
  expect((await request.delete(`/api/harvests/${foreignHarvests[0].id}`, { headers: { Authorization: ownerToken } })).status()).toBe(403);
  expect((await request.get(`/api/bagang/${foreignOwnerBagang.id}/production-costs`, { headers: { Authorization: ownerToken } })).status()).toBe(403);
  expect((await request.put(`/api/production-costs/${foreignCosts[0].id}`, { headers: { Authorization: ownerToken }, data: {} })).status()).toBe(403);
  expect((await request.put(`/api/production-costs/${workerCosts[0].id}`, { headers: { Authorization: workerToken }, data: {} })).status()).toBe(403);
  expect((await request.delete(`/api/production-costs/${workerCosts[0].id}`, { headers: { Authorization: workerToken } })).status()).toBe(403);
  expect((await request.delete(`/api/production-costs/${foreignCosts[0].id}`, { headers: { Authorization: ownerToken } })).status()).toBe(403);

  expect((await request.get(`/api/stock/summary?seasonId=1&bagangId=${foreignOwnerBagang.id}`, { headers: { Authorization: ownerToken } })).status()).toBe(403);
  expect((await request.get(`/api/reports/financial?seasonId=1&bagangId=${foreignOwnerBagang.id}`, { headers: { Authorization: ownerToken } })).status()).toBe(403);
  expect((await request.get("/api/reports/financial?seasonId=1", { headers: { Authorization: workerToken } })).status()).toBe(403);

  const workers = (await (await request.get("/api/workers", { headers: { Authorization: adminToken } })).json()).data as { id: string }[];
  const workerMe = (await (await request.get("/api/users/me", { headers: { Authorization: workerToken } })).json()).data as { worker_id: string };
  const foreignWorker = workers.find((worker) => worker.id !== workerMe.worker_id)!;
  const ownerRelatedWorkerIDs = new Set(ownerBagangs.flatMap((bagang) => [bagang.worker_id, bagang.owner_id]));
  const unrelatedOwnerWorker = workers.find((worker) => !ownerRelatedWorkerIDs.has(worker.id))!;
  const workerOwnedBagangResponse = await request.post("/api/bagang", {
    headers: { Authorization: adminToken },
    data: { name: "E2E WORKER OWNER ONLY", is_active: true, worker_id: foreignWorker.id, owner_id: workerMe.worker_id },
  });
  expect(workerOwnedBagangResponse.ok()).toBeTruthy();
  const workerOwnedBagangID = (await workerOwnedBagangResponse.json()).data.id as string;
  expect((await request.get(`/api/payroll/${workerMe.worker_id}?bagangId=${workerOwnedBagangID}`, { headers: { Authorization: workerToken } })).status()).toBe(400);
  expect((await request.delete(`/api/bagang/${workerOwnedBagangID}`, { headers: { Authorization: adminToken } })).status()).toBe(200);
  expect((await request.get(`/api/payroll/${foreignWorker.id}`, { headers: { Authorization: workerToken } })).status()).toBe(403);
  expect((await request.get(`/api/payroll/${unrelatedOwnerWorker.id}`, { headers: { Authorization: ownerToken } })).status()).toBe(400);

  for (const token of [ownerToken, workerToken]) {
    expect((await request.post("/api/harvest-types", { headers: { Authorization: token }, data: { name: "E2E FORBIDDEN" } })).status()).toBe(403);
    expect((await request.post("/api/customers", { headers: { Authorization: token }, data: { name: "E2E FORBIDDEN" } })).status()).toBe(403);
  }
  expect((await request.post("/api/bagang", { headers: { Authorization: workerToken }, data: {} })).status()).toBe(403);
  expect((await request.post("/api/sales", { headers: { Authorization: workerToken }, data: { customer: "E2E FORBIDDEN" } })).status()).toBe(403);
  expect((await request.post("/api/harvests", {
    headers: { Authorization: workerToken },
    data: { bagang_id: workerBagang.id, harvest_date: "2026-01-01", weight: 1, price: 100, harvest_type: "E2E FORBIDDEN" },
  })).status()).toBe(403);
  expect((await request.post("/api/production-costs", {
    headers: { Authorization: workerToken },
    data: { bagang_id: workerBagang.id, production_costs_type: "E2E FORBIDDEN", price: 100, creator_role: "worker" },
  })).status()).toBe(403);

  await login(page, "worker");
  await page.goto(`/pembelian/${workerBagang.id}`);
  await expect(page.getByRole("button", { name: "Tambah Panen" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Edit panen/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Hapus panen/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Pengeluaran" }).click();
  await expect(page.getByRole("button", { name: "Tambah Pengeluaran" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Edit pengeluaran/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Hapus pengeluaran/ })).toHaveCount(0);
});
