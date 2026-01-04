import { Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import DashboardPage from "./pages/Dashboard/dashboard";
import SalesPage from "./pages/Sales/page";
import AddSalesPage from "./pages/Sales/Add/page";
import DetailSalesPage from "./pages/Sales/Detail/page";
import BagangPage from "./pages/Bagang/page";
import SeasonPage from "./pages/Season/page";
import HarvestTypePage from "./pages/HarvestType/page";
import ProductionCostTypePage from "./pages/ProductionCostType/page";
import WorkerPage from "./pages/Worker/page";

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
                <Route path="/pemilik" element={<WorkerPage />} />

                {/* Sales */}
                <Route path="/pembelian" element={<SalesPage />} />
                <Route path="/pembelian/tambah" element={<AddSalesPage />} />
                <Route path="/pembelian/:id" element={<DetailSalesPage />} />
            </Route>
        </Routes>
    );
}

export default App;
