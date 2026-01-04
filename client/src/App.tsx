import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import BagangPage from "./pages/Bagang/page";

import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./component/common/ScrollToTop";
import Dashboard from "./pages/Dashboard/dashboard";
import SeasonPage from "./pages/Season/page";
import BagangHarvestPage from "./pages/Sales/page";
import SalesDetailPage from "./pages/Sales/Detail/page";
import { QueryClientProvider } from "@tanstack/react-query";
import useGlobalQueryClient from "./hooks/useGlobalQueryClient";
import BagangHarvestCreatePage from "./pages/Sales/Add/page";

export default function App() {
    const queryClient = useGlobalQueryClient();
    return (
        <>
            <QueryClientProvider client={queryClient}>
                <Router>
                    <ScrollToTop />
                    <Routes>
                        <Route element={<AppLayout />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/bagang" element={<BagangPage />} />
                            <Route path="/musim" element={<SeasonPage />} />
                            <Route path="/pembelian" element={<BagangHarvestPage />} />
                            <Route
                                path="/pembelian/:id"
                                element={<SalesDetailPage />}
                            />
                            <Route
                                path="/hasil-panen/tambah"
                                element={<BagangHarvestCreatePage />}
                            />
                            {/* <Route path="/penjualan" element={<BagangHarvestPage />} /> */}
                        </Route>
                    </Routes>
                </Router>
            </QueryClientProvider>
        </>
    );
}
