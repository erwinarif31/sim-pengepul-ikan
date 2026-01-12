import { Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import DashboardPage from "./pages/Dashboard/dashboard";
import PurchasePage from "./pages/Purchase/page";
import DetailPurchasePage from "./pages/Purchase/Detail/page";
import SalesPage from "./pages/Sales/page";
import DetailSalesPage from "./pages/Sales/Detail/page";
import BagangPage from "./pages/Bagang/page";
import SeasonPage from "./pages/Season/page";
import HarvestTypePage from "./pages/HarvestType/page";
import ProductionCostTypePage from "./pages/ProductionCostType/page";
import WorkerPage from "./pages/Worker/page";
import CustomerPage from "./pages/Customer/page";
import DetailWorkerPage from "./pages/Worker/Detail/page";

function App() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route index path="/" element={<DashboardPage />} />
                <Route path="/bagang" element={<BagangPage />} />
                <Route path="/musim" element={<SeasonPage />} />
                <Route path="/jenis-ikan" element={<HarvestTypePage />} />
                <Route
                    path="/jenis-pengeluaran"
                    element={<ProductionCostTypePage />}
                />
                <Route path="/pekerja" element={<WorkerPage />} />
                <Route path="/pekerja/:id" element={<DetailWorkerPage />} />
                <Route path="/pemilik" element={<WorkerPage />} />
                <Route path="/pemilik/:id" element={<DetailWorkerPage />} />
                <Route path="/pelanggan" element={<CustomerPage />} />

                {/* Pembelian (Purchase from Bagang) */}
                <Route path="/pembelian" element={<PurchasePage />} />
                <Route path="/pembelian/:id" element={<DetailPurchasePage />} />

                {/* Penjualan (Sales to Customer) */}
                <Route path="/penjualan" element={<SalesPage />} />
                <Route path="/penjualan/:id" element={<DetailSalesPage />} />
            </Route>
        </Routes>
    );
}

export default App;
