import { Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import DashboardPage from "./pages/Dashboard";
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
import PayrollPage from "./pages/Payroll/page";
import LoginPage from "./pages/Login/page";
import ProtectedRoute from "./component/common/ProtectedRoute";

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >
                <Route index path="/" element={<DashboardPage />} />
                <Route path="/bagang" element={<BagangPage />} />
                <Route path="/musim" element={<SeasonPage />} />
                <Route path="/jenis-ikan" element={<HarvestTypePage />} />
                <Route
                    path="/jenis-pengeluaran"
                    element={<ProductionCostTypePage />}
                />
                <Route
                    path="/pekerja"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]} fallbackTo="/">
                            <WorkerPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/pekerja/:id"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]} fallbackTo="/">
                            <DetailWorkerPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/pemilik"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]} fallbackTo="/">
                            <WorkerPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/pemilik/:id"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]} fallbackTo="/">
                            <DetailWorkerPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/pelanggan" element={<CustomerPage />} />
                <Route path="/penggajian" element={<PayrollPage />} />

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
