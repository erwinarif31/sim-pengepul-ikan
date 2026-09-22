# Testing Catchery

This document covers backend unit tests, frontend checks, Playwright end-to-end tests, and the RBAC regression contract.

## Test layers

| Layer | Location | Command | Uses database |
|---|---|---|---|
| Go unit tests | `apis/internal/usecase/*_test.go` | `go test ./...` | No |
| TypeScript check | `client/` | `pnpm typecheck` | No |
| ESLint | `client/` | `pnpm lint` | No |
| Production build | `client/` | `pnpm build` | No |
| Browser/API E2E | `client/e2e/` | `pnpm e2e` | **Yes; resets it** |

No Vitest/Jest suite or repository CI workflow currently exists.

## Prerequisites

- Go 1.23.1 or compatible version from `apis/go.mod`
- Node.js and pnpm
- PostgreSQL with `psql` available on `PATH`
- Current schema already applied from `apis/db/migrations/`; E2E reset seeds data but does not run migrations
- `apis/config.json` configured for a **disposable** PostgreSQL database
- Chromium installed for Playwright

The supplied E2E scripts expect these exact database values in `apis/config.json`:

| Setting | Required value |
|---|---|
| Host | `localhost` |
| Port | `5432` |
| Database | `catchery` |
| User | `postgres` |

Password comes from `apis/config.json`. API must listen on `http://localhost:8888`; Vite runs on `http://localhost:5173`. Kafka is not required because its producer is disabled.

## First-time setup

```sh
cd apis
cp config.json.example config.json # only when config.json does not exist
# Set database.password and ensure current migrations are applied.
go run cmd/web/main.go
```

In another terminal:

```sh
cd client
pnpm install
pnpm exec playwright install chromium
pnpm e2e
```

Playwright starts Vite automatically. Backend API and PostgreSQL must already be running.

## Backend unit tests

Run all active Go tests:

```sh
cd apis
go test ./...
```

Useful focused commands:

```sh
go test ./internal/usecase -run TestAuthorizeProductionCostMutation -count=1
go test ./internal/usecase -run 'Test(BagangScopeByRole|SalesResponseScopesPaymentsAndDetails)' -count=1
go test -cover ./...
```

Active unit tests cover report date ranges, financial calculations, stock and weight validation, sales allocation/scoping, bagang scope, and production-cost authorization.

### Active Go test case catalog

All active cases are database-free. `TestSalesDetailScopeApplyAddsEmptyGuardAndIDs` uses GORM DryRun and never opens a real connection.

#### GO-01 — Normalize fish-type input

**Source:** `TestNormalizeFishType` in `apis/internal/usecase/report_scope_test.go`

- Inputs: `" Tuna "`, `"TUNA"`, and `" tongkol "`.
- Action: call `normalizeFishType` for each input.
- Expected: surrounding spaces are removed and case is normalized, producing `tuna`, `tuna`, and `tongkol`.
- Protects: stock and report grouping cannot split one fish type because of casing or whitespace.

#### GO-02 — Inclusive report end date

**Source:** `TestBuildReportDateRangeUsesInclusiveEndDate`

- Setup: season runs 1–31 July 2026; requested filter is 10–20 July.
- Action: call `buildReportDateRange`.
- Expected: start is `2026-07-10T00:00:00Z`; exclusive query boundary is `2026-07-21T00:00:00Z`, so all activity on 20 July is included.
- Protects: user-facing inclusive end dates remain correct in SQL ranges.

#### GO-03 — Report range outside season

**Source:** `TestBuildReportDateRangeIntersectsSeason`

- Setup: season ends 31 July 2026; requested filter is 1–2 August.
- Action: build report date range.
- Expected: no error, but range is marked empty.
- Protects: reports do not include activity outside selected season.

#### GO-04 — Reversed report dates

**Source:** `TestBuildReportDateRangeRejectsReversedDates`

- Setup: requested start is 20 July and end is 10 July.
- Action: build report date range.
- Expected: error is returned.
- Protects: invalid date filters do not silently produce misleading totals.

#### GO-05 — Decimal and negative stock summary

**Source:** `TestStockSummaryRowsPreserveDecimalWeightAndNegativeBalance`

- Setup: Bagang A tuna has 100.5 kg in and 60 kg out; unassigned tongkol has 0 kg in and 12 kg out.
- Action: convert stock map into report rows.
- Expected: tuna balance remains 40.5 kg and is not negative; tongkol has no bagang ID, name `Tanpa Bagang`, balance -12 kg, and negative flag set; exactly two rows are returned.
- Protects: decimal precision, negative-stock warnings, and unassigned legacy stock labeling.

#### GO-06 — Financial calculations

**Source:** `TestFinancialCalculations`

- Sale details `2 × 100` and `3 × 50`, with payments 250 and 100, must produce revenue 350 and paid 350.
- `nonNegative(350 - 400)` and receivable for revenue 100/paid 150 must both be zero.
- Two sales totaling revenue 400 and payments 250 must produce receivable 200; overpayment on one sale must not offset another sale's debt.
- Net profit for revenue 1,000 and costs 250 must be 750.
- Profit margin with zero revenue must be zero.
- Harvest value `100 × 1.236` must round to 124.
- Sale detail value `1.234 × 1,000` must equal 1,234.
- Protects: dashboard/report money totals, rounding, receivables, and divide-by-zero behavior.

#### GO-07 — Allocate mixed-sale payments by bagang

**Source:** `TestSaleTotalsAllocateSharedSaleByBagang`

- Setup: one sale has Bagang 1 revenue 100 and Bagang 2 revenue 300, with payment 200.
- Action: calculate totals for Bagang 1 scope only.
- Expected: visible revenue is 100 and allocated payment is 50.
- Rounding case: equal 100/100 details share a payment of 1; deterministic allocation must be 1 to first scope and 0 to second, while allocated parts still sum to 1.
- Protects: no payment value is lost, duplicated, or leaked across bagang scopes.

#### GO-08 — Scope sale response for non-admin roles

**Source:** `TestSalesResponseScopesPaymentsAndDetails`

- Setup: paid mixed sale has Bagang 1 revenue 100, Bagang 2 revenue 300, and one global payment of 200.
- Action: map sale to OWNER response scoped to Bagang 1.
- Expected OWNER response: one detail, total 100, allocated paid 50, `payments_visible=true`, no raw transaction rows, no global paid-off date, and scoped paid-off status false.
- Expected ADMIN response: both details, one transaction row, total 400, and paid 200.
- Protects: bagang-private sales/payment data while preserving full admin view.

#### GO-09 — Authorize production-cost mutation

**Source:** `TestAuthorizeProductionCostMutation`

| Subcase | Auth and cost | Expected |
|---|---|---|
| `admin` | ADMIN mutates a worker cost | Allowed |
| `owner own` | OWNER ID matches creator; role `owner` | Allowed |
| `owner shared` | OWNER ID matches creator; role `both` | Allowed |
| `owner worker cost` | OWNER ID matches creator; role `worker` | Denied |
| `worker own` | WORKER ID matches creator; role `worker` | Allowed |
| `worker owner cost` | WORKER ID matches creator; role `owner` | Denied |
| `worker shared cost` | WORKER ID matches creator; role `both` | Denied |
| `wrong creator` | OWNER role matches, creator ID differs | Denied |
| `missing auth` | No authenticated user | Denied |

Protects: OWNER and WORKER cannot edit/delete counterpart-private costs even when both belong to same bagang or same person ID.

#### GO-10 — Bagang scope by role

**Source:** `TestBagangScopeByRole`

| Subcase | Auth identity against bagang | Expected |
|---|---|---|
| `admin` | ADMIN | In scope |
| `owner in scope` | OWNER matches `owner_id` | In scope |
| `owner out of scope` | OWNER does not match `owner_id` | Out of scope |
| `worker in scope` | WORKER matches `worker_id` | In scope |
| `worker out of scope` | WORKER does not match `worker_id` | Out of scope |

Protects: shared bagang scope predicate used by protected use cases.

#### GO-11 — SQL guard for scoped sale details

**Source:** `TestSalesDetailScopeApplyAddsEmptyGuardAndIDs`

- Setup: GORM PostgreSQL DryRun session; no real database.
- Action 1: apply filtered IDs `bagang-1` and `bagang-2`.
- Expected 1: generated SQL includes `scoped_sales_detail.bagang_id IN ($1,$2)`.
- Action 2: apply a filtered scope with no IDs.
- Expected 2: generated SQL includes `1 = 0`.
- Protects: an empty role scope returns zero sales instead of accidentally returning every sale.

#### GO-12 — Stock sufficiency boundaries

**Source:** `TestHasSufficientStock` in `apis/internal/usecase/sales_stock_test.go`

| Subcase | Stock in | Stock out | Requested | Expected |
|---|---:|---:|---:|---|
| `enough stock` | 100.5 | 60 | 40.5 | Allowed |
| `exact stock` | 100 | 60 | 40 | Allowed |
| `insufficient stock` | 100 | 60 | 40.1 | Denied |
| `decimal remainder` | 60.5 | 60 | 0.6 | Denied |

Protects: exact and decimal stock limits during sale-item creation/update.

#### GO-13 — Sale weight precision

**Source:** `TestValidateSalesDetailWeight`

- Action: validate weights 1.234 kg and 1.2345 kg.
- Expected: three decimal places are accepted; four decimal places are rejected.
- Protects: database-compatible weight precision and predictable stock arithmetic.

### Legacy Go test catalog — excluded and destructive

`apis/test/` contains 33 old integration-style tests behind the `legacy` build tag. They use a real database, call `ClearAll`, and are excluded from normal `go test ./...`. This catalog documents them; it does **not** recommend running them. Never enable `-tags=legacy` against valuable data.

Shared legacy precondition: the legacy Fiber app/test database is initialized, an authenticated fixture user exists when required, and tests may invoke other tests as setup.

#### Legacy user cases — `apis/test/user_test.go`

| Case | Setup/action | Expected |
|---|---|---|
| `TestRegister` | Clear all rows; bcrypt-hash `rahasia`; insert WORKER `khannedy` directly | Hashing and database insert return no error |
| `TestLogin` | Register `khannedy`; POST `/api/users/login` with correct password | 200; response token exists and equals stored database token |
| `TestLoginWrongUsername` | Register user; login ID `wrong` | 401 with error payload |
| `TestLoginWrongPassword` | Register user; login with password `wrong` | 401 with error payload |
| `TestLogout` | Login valid user; POST `/api/users/logout` with token | 200 and successful boolean response; session is invalidated |
| `TestLogoutWrongAuthorization` | POST logout with invalid authorization | 401 with error payload |
| `TestGetCurrentUser` | Login; GET `/api/users/me` with token | 200; returned user ID matches fixture |
| `TestGetCurrentUserFailed` | GET `/api/users/me` without valid authorization | 401 with error payload |
| `TestUpdateUserName` | Login; PUT `/api/users/me` with name `Eko Kurniawan Khannedy` | 200; response and persisted name are updated |
| `TestUpdateUserPassword` | Login; PUT `/api/users/me` with `rahasialagi` | 200; persisted password validates against new value |
| `TestUpdateFailed` | PUT `/api/users/me` without valid authorization | 401 with error payload |

#### Legacy contact cases — `apis/test/contact_test.go`

| Case | Setup/action | Expected |
|---|---|---|
| `TestCreateContact` | Authenticated POST `/api/contacts` with valid name/email/phone | 200 and returned contact fields match request |
| `TestCreateContactFailed` | POST blank contact fields | 400 with validation error |
| `TestGetConnect` | Create and fetch user's existing contact by ID | 200 and returned ID/fields match stored contact |
| `TestGetContactFailed` | GET random contact UUID | 404 |
| `TestUpdateContact` | PUT valid changed name/email/phone to existing contact | 200 and returned/persisted fields are changed |
| `TestUpdateContactFailed` | PUT blank fields to existing contact | 400 |
| `TestUpdateContactNotFound` | PUT to random UUID | 404 |
| `TestDeleteContact` | DELETE existing contact | 200 with `true` response |
| `TestDeleteContactFailed` | DELETE random UUID | 404 |
| `TestSearchContact` | Create 20 contacts; GET `/api/contacts` | 200 with default page size of 10 |
| `TestSearchContactWithPagination` | Create 20; GET `?page=2&size=5` | 200 with 5 results |
| `TestSearchContactWithFilter` | Create 20; filter by name, phone, and email | 200 with 10 matching results |

#### Legacy address cases — `apis/test/address_test.go`

| Case | Setup/action | Expected |
|---|---|---|
| `TestCreateAddress` | Create contact; POST valid nested address | 200 and returned street matches request |
| `TestCreateAddressFailed` | POST invalid/blank nested address | 400 |
| `TestListAddresses` | Create contact with five addresses; GET nested collection | 200 with exactly five addresses |
| `TestListAddressesFailed` | GET addresses for contact ID `wrong` | 404 |
| `TestGetAddress` | GET existing nested address | 200 with matching address ID and street |
| `TestGetAddressFailed` | GET nested address ID `wrong` | 404 |
| `TestUpdateAddress` | PUT valid street change to existing address | 200 and returned street matches request |
| `TestUpdateAddressFailed` | PUT invalid address payload | 400 |
| `TestDeleteAddress` | DELETE existing nested address | 200 with `true` response |
| `TestDeleteAddressFailed` | DELETE nested address ID `wrong` | 404 |

## Frontend checks

```sh
cd client
pnpm typecheck
pnpm lint
pnpm build
```

Run all three before browser tests. `pnpm build` also runs TypeScript compilation.

## Playwright E2E

> **Destructive:** Every Playwright invocation runs global database reset first, including a single file or `--grep` run. Use only disposable data.

Authoritative command:

```sh
cd client
pnpm e2e
```

Do not use bare `pnpm exec playwright test`. Package scripts provide the database confirmation expected by `client/scripts/reset-e2e-db.mjs`; without exact confirmation the reset refuses to run.

### Run modes

```sh
pnpm e2e:headed # visible browser
pnpm e2e:slow   # visible browser, 500 ms between actions
pnpm e2e:debug  # Playwright inspector and step mode
```

Target one file or test name:

```sh
pnpm e2e e2e/auth-rbac.spec.ts
pnpm e2e --grep "production-cost mutations"
pnpm e2e:slow --grep "downloads a bagang-filtered"
```

Tests run serially with one worker because they share one reset database. `zz-season.spec.ts` runs in a dependent project after other Chromium tests because it ends the active season.

### What reset does

`client/e2e/global-setup.ts` always calls `client/scripts/reset-e2e-db.mjs`. The script:

1. Verifies explicit reset confirmation against `apis/config.json`.
2. Executes `apis/db/seed/truncate.sql` with `TRUNCATE ... CASCADE`.
3. Seeds reference data and one active season.
4. Runs `go run cmd/seed/main.go`.
5. Verifies expected row counts and test accounts before tests start.

Run reset without browser tests only when needed:

```sh
cd client
CATCHERY_E2E_RESET=YES \
CATCHERY_E2E_DB=catchery \
CATCHERY_E2E_HOST=localhost \
CATCHERY_E2E_PORT=5432 \
CATCHERY_E2E_USER=postgres \
pnpm e2e:reset
```

Seed IDs, names, and counts are part of the E2E contract. Update reset verification and affected tests together when changing the seeder.

## Seeded test accounts

These credentials exist only in disposable seeded data:

| Role | ID | Password |
|---|---|---|
| ADMIN | `admin` | `admin123` |
| OWNER | `owner1` | `owner123` |
| OWNER | `owner2` | `owner223` |
| WORKER | `worker1` | `worker123` |
| WORKER | `worker2` | `worker223` |

## E2E coverage map

| File | Coverage |
|---|---|
| `client/e2e/auth-rbac.spec.ts` | Login/session/logout, route and control visibility, scoped rows, direct API authorization, forged foreign IDs, sales/payment scope, payroll scope, production-cost creator roles |
| `client/e2e/dashboard-routes.spec.ts` | Active-season selection, dashboard metrics/charts, permitted static routes, dynamic detail routes, unexpected API failures |
| `client/e2e/master.spec.ts` | Fish types, production-cost types, workers, owners, customers, and bagang CRUD/validation |
| `client/e2e/operations.spec.ts` | Harvest and cost CRUD, stock changes, overselling rejection, sales payments, stock/report filters, payroll PDF download |
| `client/e2e/zz-season.spec.ts` | Ending the active season and creating the next season |

### Detailed Playwright test case catalog

The IDs below are documentation IDs; Playwright selects tests by their quoted source titles.

#### PW-01 — Authentication validation, persistence, and logout history

**Source title:** `auth validates, persists session, and protects logout history`  
**File:** `client/e2e/auth-rbac.spec.ts`

**Preconditions**

- Browser starts unauthenticated.
- Seeded ADMIN account exists.

**Steps and expected results**

1. Open `/bagang`; protected route must redirect to `/login`.
2. Submit empty login form; `ID wajib diisi` and `Password wajib diisi` must appear.
3. Submit `admin` with wrong password; alert must equal `ID atau password tidak valid.`.
4. Submit correct ADMIN password; URL must become `/` and `Dashboard` heading must appear.
5. Poll session storage; `catchery.auth.token` must be non-null.
6. Reload; authenticated dashboard must remain visible.
7. Open `/bagang`; `Data Bagang` must render.
8. Click `Keluar`; URL must become `/login`.
9. Navigate browser history backward; route must remain `/login`, proving stale history cannot reopen protected UI.
10. Poll session storage; auth token must be removed.

**Side effects:** session token is created and revoked; business data unchanged.

#### PW-02 — Sales and payment values remain in bagang scope

**Source title:** `sales and payments stay within bagang scope`  
**File:** `client/e2e/auth-rbac.spec.ts`

**Preconditions**

- ADMIN, OWNER, and WORKER API tokens.
- Season 1 has separate OWNER-visible and WORKER-visible bagangs with at least 10 kg stock.

**Steps and expected results**

1. Fetch each role's bagangs and admin stock summary; select distinct owner/worker stock sources.
2. ADMIN creates a mixed sale with one owner item worth 10,000 and one worker item worth 30,000, then records payment 20,000.
3. Fetch mixed sale as ADMIN:
   - total amount 40,000;
   - total paid 20,000;
   - two sale details;
   - one raw transaction row.
4. Fetch same sale as OWNER:
   - only owner item is returned;
   - visible amount is 10,000;
   - allocated paid amount is 5,000;
   - scoped paid-off state is false;
   - raw transaction rows are absent.
5. Fetch same sale as WORKER:
   - only worker item is returned;
   - visible amount is 30,000;
   - allocated paid amount is 15,000;
   - scoped paid-off state is false;
   - raw transaction rows are absent.
6. Create equal-value two-bagang sale and pay 1; deterministic remainder allocation must place it in `is_paid_off=true`, not `is_paid_off=false`, for selected receiving scope.
7. Create worker-only sale; OWNER detail GET must return 404, WORKER detail GET 200.
8. OWNER adding own-bagang item to already visible mixed sale must return 200.
9. OWNER adding item to invisible worker-only sale must return 404.
10. OWNER forging worker bagang item on mixed sale must return 403.
11. WORKER attempting sale-item mutation must return 403.
12. OWNER payment creation on mixed sale with own Bagang detail must return 200.
13. OWNER payment update/delete on that sale must return 200.
14. WORKER payment creation must return 403.
15. OWNER payment creation on worker-only sale must return 403.

**Side effects:** intentionally leaves controlled sales, items, and payments for remainder of reset run.

#### PW-03 — Production-cost role and creator-ownership mutation rules

**Source title:** `production-cost mutations respect role and creator ownership`  
**File:** `client/e2e/auth-rbac.spec.ts`

**Preconditions**

- ADMIN, OWNER2, and WORKER tokens.
- Temporary bagang assigns OWNER2 as owner and WORKER as worker.

**Steps and expected results**

1. Create three BBM costs: OWNER cost 1,000, WORKER cost 2,000, shared `both` cost 3,000.
2. Login OWNER2 and open purchase expenses:
   - edit action for owner cost visible;
   - edit action for shared cost visible;
   - worker-cost edit action absent.
3. Clear browser session, login WORKER, reopen expenses:
   - worker-cost edit action absent;
   - owner/shared edit actions absent.
4. Refresh API tokens because same-account UI logins invalidate old tokens.
5. OWNER PUT and DELETE against worker cost must return 403.
6. WORKER PUT and DELETE against owner cost must return 403.
7. WORKER PUT and DELETE against shared cost must return 403.
8. WORKER PUT and DELETE against own worker cost must return 403.
9. OWNER update owner/shared costs must return 200.
10. ADMIN deletes worker cost; response must be 200.
11. OWNER deletes owner/shared costs; response must be 200.
12. ADMIN deletes temporary bagang; response must be 200.

**Side effects:** temporary bagang and all three costs are removed before test ends.

#### PW-04 — Role navigation, scoped rows, and protected controls

**Source titles:** `roles expose permitted navigation, scoped rows, and protected data`; `payroll rows and filters follow role scope`  
**File:** `client/e2e/auth-rbac.spec.ts`

**Preconditions**

- Seed includes Bagang 1/2/3, Person 1/2/3, sales, costs, and payroll data.
- ADMIN data is used to dynamically identify sales foreign to OWNER and WORKER.

**API expectations before UI checks**

1. OWNER/WORKER sale lists must be non-empty and contain only details from each role's bagang IDs.
2. Scoped sale rows must expose allocated totals but no raw transaction rows.
3. Foreign sales must be absent from lists; direct foreign detail GET must return 404.
4. OWNER sale creation must return 403.
5. Dashboard recent-sales IDs must be subsets of role-visible sale IDs.
6. Each recent sale's paid flag must equal `total_amount > 0 && total_paid >= total_amount`.

**OWNER UI expectations**

1. `Bagang` and `Pelanggan` links visible; `Musim`, `Pekerja`, `Pemilik`, `Jenis Ikan`, and `Jenis Pengeluaran` links absent.
2. `Laporan Keuangan` link visible; direct `/musim`, `/jenis-ikan`, and `/pekerja` navigation redirects to `/`.
3. `/pelanggan` remains accessible but `Tambah` control is absent.
4. Bagang table shows Bagang 1, not Bagang 2.
4. Direct API fetch for foreign Bagang 2 returns 403.
5. Foreign purchase detail redirects to `/pembelian`; `Tambah Panen` absent.
6. New expense modal permits only `Pemilik` creator role.
7. Shared-cost edit modal permits only stored `Umum` role; changing price must preserve `creator_role=both` and persist 23,456.
8. Payroll API and table show only rows for Bagang 1 and related worker/owner; unrelated Bagang 2 is absent.
9. Payroll columns are exactly `Nama`, `Bagang`, `Musim`, and `Cetak PDF`; filters for all three data columns are visible.
10. Selecting Nama, Bagang, and Musim filters leaves matching payroll row and `Cetak PDF` action; owner PDF request returns 200.
11. Sales create button absent; row count matches scoped API result page.
12. Sale detail hides raw payment history but shows `Riwayat Pembayaran` and `Tambah Pembayaran` for own Bagang; admin-only management marker remains absent.

**WORKER UI expectations**

1. `Bagang` link visible; `Musim`, `Pelanggan`, `Pekerja`, `Pemilik`, `Jenis Ikan`, and `Jenis Pengeluaran` links absent.
2. Financial-report link absent; direct `/laporan-keuangan`, `/musim`, `/pelanggan`, and `/jenis-pengeluaran` navigation redirects to `/`.
3. Sales create button absent.
4. Bagang table shows Bagang 3, not Bagang 2; direct foreign fetch returns 403.
5. Payroll shows Person 3/Bagang 3 only, not Person 1.
6. Purchase Detail hides worker add/edit/delete harvest and production-cost controls.
7. Sales table count matches scoped API result; detail hides raw payment history and payment mutation controls.

**Side effects:** creates, edits, verifies, then deletes one shared cost.

#### PW-05 — Direct API and forged foreign-ID boundaries

**Source title:** `backend enforces direct and foreign role boundaries`  
**File:** `client/e2e/auth-rbac.spec.ts`

**Preconditions**

- ADMIN discovers OWNER-visible, WORKER-visible, and foreign bagangs.
- Foreign bagang has at least one harvest and production cost.

**Expected authorization matrix**

| Request | Caller | Expected |
|---|---|---:|
| Update/delete foreign bagang | OWNER | 403 |
| Reassign owned bagang to foreign owner | OWNER | 403 |
| Create bagang with foreign owner | OWNER | 403 |
| Update/delete assigned bagang | WORKER | 403 |
| List foreign bagang harvests | OWNER | 403 |
| Update/delete foreign harvest ID | OWNER | 403 |
| Update/delete assigned harvest ID | WORKER | 403 |
| List foreign bagang costs | OWNER | 403 |
| Update/delete foreign cost ID | OWNER | 403 |
| Update/delete assigned cost ID | WORKER | 403 |
| Filter stock by foreign bagang ID | OWNER | 403 |
| Filter financial report by foreign bagang ID | OWNER | 403 |
| Read financial report | WORKER | 403 |
| Payroll for another worker | WORKER | 403 |
| Payroll for unrelated worker | OWNER | 400 |
| Create harvest type/customer | OWNER or WORKER | 403 |
| Create bagang or sale | WORKER | 403 |
| Create harvest on assigned bagang | WORKER | 403 |
| Create production cost on assigned bagang | WORKER | 403 |
| View Purchase Detail mutation controls | WORKER | Add/edit/delete buttons hidden |

**Special payroll escalation check**

1. ADMIN creates temporary bagang where current WORKER identity is owner but a different person is assigned worker.
2. WORKER requests own payroll with forged `bagangId` for that owner-only bagang.
3. Expected status is 400; ownership alone cannot expand WORKER payroll scope.
4. ADMIN deletes temporary bagang with 200.

**Side effects:** temporary owner-only bagang is removed.

#### PW-06 — Collector capital formulas and dashboard widgets

**Source title:** `dashboard and financial report use harvest value as collector capital`  
**File:** `client/e2e/dashboard-routes.spec.ts`

**Preconditions:** ADMIN login; API/page-error collector attached before login.

**Expected results**

- Dashboard `net_profit` equals `total_sales_revenue - total_harvest_value`.
- Every bagang performance `net_profit` equals `sales_revenue - harvest_value`.
- Financial-report `net_profit` equals `total_sales_revenue - total_harvest_value` and renders `Modal (nilai panen)`.
- First season select has value `1`.
- Visible KPI labels: `Nilai Panen`, `Biaya Produksi (Pinjaman)`, `Total Penjualan`, `Laba Bersih`.
- Visible chart/table labels: `Tren Nilai Panen`, `Panen per Jenis`, `Performa Bagang`, `Penjualan Terbaru`.
- No API response with status >=400 and no browser page error occurs.
- Business data remains unchanged.

#### PW-07 — Every permitted static route renders

**Source title:** `every permitted app route renders its own content without API failures`  
**File:** `client/e2e/dashboard-routes.spec.ts`

For each role, test logs in, visits every path below, verifies exact pathname and page marker, verifies no `Memuat...` state remains, asserts zero API/page errors, then logs out.

| Role | Routes and required marker |
|---|---|
| ADMIN | `/` Dashboard; `/bagang` Data Bagang; `/musim` Musim; `/jenis-ikan` Jenis Ikan; `/jenis-pengeluaran` Jenis Pengeluaran; `/pekerja` and `/pemilik` Pekerja/Pemilik; `/pelanggan` Pelanggan; `/penggajian` Penggajian; `/stok` Stok; `/laporan-keuangan` Laporan Keuangan; `/pembelian/` Pembelian; `/penjualan/` Penjualan |
| OWNER | Dashboard, Bagang, Pelanggan, Penggajian, Stok, Laporan Keuangan, Pembelian, Penjualan |
| WORKER | Dashboard, Bagang, Penggajian, Stok, Pembelian, Penjualan |

**Side effects:** only login/logout tokens change.

#### PW-08 — Dynamic detail routes render

**Source title:** `admin dynamic worker, purchase, and sales detail routes load`  
**File:** `client/e2e/dashboard-routes.spec.ts`

1. Login ADMIN and attach API/page-error collector.
2. Open worker list, follow last worker detail link; `Detail ...` must appear.
3. Open purchase list, follow last purchase detail link; `Detail Pembelian` must appear.
4. Open sales list, follow last sale detail link; `Detail Penjualan #...` must appear.
5. No API failure or page error may occur.

**Side effects:** none.

#### PW-09 — Harvest-type and production-cost-type CRUD

**Source title:** `manages fish and production-cost types`  
**File:** `client/e2e/master.spec.ts`

1. Login ADMIN and open `/jenis-ikan`.
2. Open add form and submit empty; `Nama jenis ikan wajib diisi` must appear.
3. Create `E2EIKAN`; table cell must appear.
4. Accept confirmation and delete; DELETE response must be successful; after reload row must be absent.
5. Open `/jenis-pengeluaran`; create `E2EBIAYA`.
6. Search exact name; row must appear.
7. Accept confirmation and delete; DELETE response must be successful; after reload row must be absent.

**Side effects:** both temporary type records are removed.

#### PW-10 — Worker, owner page, customer, and bagang CRUD

**Source title:** `manages workers, owners, customers, and bagang`  
**File:** `client/e2e/master.spec.ts`

1. Create worker `E2E Pekerja`, search it, edit to `E2E Pekerja Ubah`, delete, await successful DELETE, reload, and verify absence.
2. Open `/pemilik`; heading `Pekerja/Pemilik` must render.
3. Create customer `E2E Pelanggan`, search it, edit to `E2E Pelanggan Ubah`, delete, await successful DELETE, reload, and verify absence.
4. Create bagang `E2E Bagang` with Person 1 as worker and Person 2 as owner.
5. Search it, edit to `E2E Bagang Ubah`, delete, await successful DELETE, reload, and verify absence.

**Side effects:** all temporary worker, customer, and bagang records are removed.

#### PW-11 — Harvest and production-cost lifecycle

**Source title:** `creates, edits, and deletes harvests and production costs`  
**File:** `client/e2e/operations.spec.ts`

**Harvest flow**

1. Login ADMIN; open last purchase detail.
2. Submit empty harvest form; `Jenis ikan wajib dipilih` must appear.
3. Create `Kecil`, 2 kg, price 21,000; `Panen ditambahkan` must appear.
4. Edit same record to 3 kg; `Panen diubah` must appear.
5. Accept confirmation and delete; `Panen dihapus` must appear.

**Production-cost flow**

1. Open expenses and create BBM cost 125,000; `Pengeluaran ditambahkan` must appear.
2. Edit same cost to 130,000; `Pengeluaran diubah` must appear.
3. Accept confirmation and delete; `Pengeluaran dihapus` must appear.

**Side effects:** temporary harvest and cost are removed.

#### PW-12 — Sale stock invariant, overselling, and payment state

**Source title:** `sale item changes stock and rejects overselling; payments change paid state`  
**File:** `client/e2e/operations.spec.ts`

**Preconditions:** season 1 has a stock row with at least 3 kg.

**Steps and expected results**

1. Login ADMIN; open sale creation and nested customer modal.
2. Create `E2E Sale Customer`; nested modal closes and sale save becomes enabled.
3. Save sale, search customer, and open sale detail.
4. Fetch live stock source and original balance through `/api/stock/summary?seasonId=1`.
5. Submit empty item form; `Jenis ikan wajib dipilih` appears.
6. Add 1 kg item at 20,000 from selected bagang/type; `Item ditambahkan` appears and stock becomes original -1.
7. Edit item to 2 kg; `Item diubah` appears and stock becomes original -2.
8. Attempt weight greater than available stock; literal error `insufficient stock for selected bagang and harvest type` appears.
9. Restore valid 2 kg and save.
10. Add payment 5,000; sale shows `BELUM LUNAS`.
11. Edit payment to 40,000; sale shows `LUNAS`.
12. Delete payment; sale returns to `BELUM LUNAS`.
13. Delete item; `Item dihapus` appears and stock returns to original balance.

**Side effects:** item/payment removed; created sale and customer remain until next reset.

#### PW-13 — Stock and financial-report filters

**Source title:** `filters stock and reports with labeled controls`  
**File:** `client/e2e/operations.spec.ts`

1. Login ADMIN and open `/stok`.
2. `Saldo stok` must appear and `Saldo negatif` must be absent for seed data.
3. Filter Bagang 1; matching cell must appear.
4. Filter dates to 1 January–31 December 2030; empty-state text must be `Tidak ada aktivitas stok untuk filter ini.`.
5. Open `/laporan-keuangan`; `Pendapatan penjualan`, `Rincian Penjualan`, and at least one row must appear initially.
6. Apply Bagang 1 and same future date range; empty-state text must be `Tidak ada penjualan untuk filter ini.`.

**Side effects:** none.

#### PW-14 — Season- and Bagang-filtered payroll PDF

**Source title:** `downloads a season- and bagang-filtered non-empty payroll PDF`  
**File:** `client/e2e/operations.spec.ts`

1. Login ADMIN and open `/penggajian`.
2. Locate Person 1 / Bagang 1 row.
3. Click `Cetak PDF` while waiting for browser download and HTTP 200 `/api/payroll/...?...bagangId=<selected>&seasonId=1` response.
4. Response `content-type` must contain `application/pdf`.
5. Suggested filename must end in `.pdf`.
6. Download stream byte count must be greater than zero.

**Limitation:** validates HTTP type, filter query, filename, and non-empty bytes; it does not parse PDF text/layout.

#### PW-15 — End active season and filter purchase history

**Source title:** `admin ends active season and purchase detail filters historical records`  
**File:** `client/e2e/zz-season.spec.ts`

**Preconditions:** runs in dependent `season` Playwright project after all normal Chromium tests; selected bagang has harvest and production-cost rows in active season.

1. Login ADMIN, capture a purchase detail URL, and record one visible harvest ID and production-cost ID from current active season.
2. Open `/musim`; table must contain two rows including header.
3. Arm confirmation acceptance and click `Akhiri Musim`; table must grow to three rows.
4. Reopen purchase detail; `Filter musim` must default to newly active season, not prior season.
5. Prior harvest and production-cost IDs must be hidden in their respective tabs.
6. Select `Semua Musim`; `Musim` column and both historical record IDs must become visible.

**Side effects:** intentionally ends seed season and creates next active season; this is why test runs last.

### Shared E2E state assumptions

- Global reset runs once per Playwright invocation, not before each case.
- Suite is serial and some cases intentionally leave sales/customer data; cases are not transaction-isolated.
- Seed labels/IDs such as season 1, Bagang 1/2/3, Person 1/2/3, `BBM`, and `Kecil` are test contracts.
- `firstDetailUrl` selects last matching detail link, so assertions must not assume a fixed generated record ID.
- `apiFailures` tracks responses >=400 and page errors only in tests that explicitly attach it. Expected negative authorization requests use APIRequestContext instead.
- `zz-season.spec.ts` is isolated in dependent project because its mutation would break earlier tests.

### RBAC regression contract

Tests must verify both UI behavior and direct API enforcement. Hiding a button is not authorization.

| Role | Expected scope |
|---|---|
| ADMIN | All records and administrative mutations |
| OWNER | Owned-bagang data; own `owner` and `both` production costs; permitted owner workflows |
| WORKER | Assigned-bagang data; own `worker` production costs; permitted worker workflows |

Required boundary checks include:

- Forbidden routes and controls are absent.
- Direct API requests remain denied when UI is bypassed.
- Foreign bagang, harvest, production-cost, sale, report, stock, and payroll IDs cannot expand scope.
- OWNER and WORKER cannot mutate each other's private production costs on a shared bagang.
- WORKER payroll cannot include a bagang where that person is only the owner.
- Non-admin sale/payment totals include only allocation belonging to visible bagangs.

## Writing E2E tests

- Reuse `login`, `apiToken`, and other helpers from `client/e2e/support.ts`.
- Prefer accessible selectors such as role, label, and visible name.
- Create controlled records when a permission depends on creator, role, or bagang assignment; do not infer authorization from random seeded rows.
- Assert response status and persisted state for security-sensitive mutations.
- Keep tests serial. Clean up controlled records when later tests could observe them.
- Keep season-ending behavior in `zz-season.spec.ts`.
- One account has one current stored token. Logging in again as the same account invalidates its previous API/UI token; request a fresh token before later API assertions.

## Failure artifacts

On failure, Playwright keeps trace, video, and screenshot artifacts under `client/test-results/`.

Open a trace with:

```sh
cd client
pnpm exec playwright show-trace test-results/<test-directory>/trace.zip
```

Use headed or debug mode when selectors or timing need inspection.

## Troubleshooting

### `Refusing reset`

`apis/config.json` does not exactly match the confirmed host, port, database, or user. Use the disposable local values above. Do not weaken the guard.

### `psql` not found or database connection failed

Install PostgreSQL client tools, start PostgreSQL, then verify credentials from `apis/config.json` manually.

### Seed verification failed

Schema may be stale, a migration may be missing, or seed counts/IDs changed. Apply current migrations, then rerun. If seed shape changed intentionally, update `reset-e2e-db.mjs` and dependent tests together.

### Browser executable missing

```sh
cd client
pnpm exec playwright install chromium
```

### API requests fail or time out

Confirm API is running on port 8888 and Vite proxy uses the same URL. Stop an old Vite process if Playwright reused one with different configuration.

### Unexpected `401` after another login

Login replaces that account's stored token. Refresh the token or avoid concurrent sessions for the same seeded account.

## Pre-merge checklist

```sh
cd apis
go test ./...

cd ../client
pnpm typecheck
pnpm lint
pnpm build
pnpm e2e
```

Expected result: every command exits with status 0 and Playwright reports no failed tests.
