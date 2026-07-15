# Client routes

Source: `src/App.tsx`

| Route | Page component | Source |
|---|---|---|
| `/` | `DashboardPage` | `src/pages/Dashboard/index.tsx` |
| `/bagang` | `BagangPage` | `src/pages/Bagang/page.tsx` |
| `/musim` | `SeasonPage` | `src/pages/Season/page.tsx` |
| `/jenis-ikan` | `HarvestTypePage` | `src/pages/HarvestType/page.tsx` |
| `/jenis-pengeluaran` | `ProductionCostTypePage` | `src/pages/ProductionCostType/page.tsx` |
| `/pekerja` | `WorkerPage` | `src/pages/Worker/page.tsx` |
| `/pekerja/:id` | `DetailWorkerPage` | `src/pages/Worker/Detail/page.tsx` |
| `/pemilik` | `WorkerPage` | `src/pages/Worker/page.tsx` |
| `/pemilik/:id` | `DetailWorkerPage` | `src/pages/Worker/Detail/page.tsx` |
| `/pelanggan` | `CustomerPage` | `src/pages/Customer/page.tsx` |
| `/penggajian` | `PayrollPage` | `src/pages/Payroll/page.tsx` |
| `/pembelian` | `PurchasePage` | `src/pages/Purchase/page.tsx` |
| `/pembelian/:id` | `DetailPurchasePage` | `src/pages/Purchase/Detail/page.tsx` |
| `/penjualan` | `SalesPage` | `src/pages/Sales/page.tsx` |
| `/penjualan/:id` | `DetailSalesPage` | `src/pages/Sales/Detail/page.tsx` |

All routes render inside `AppLayout`.
