import { useState, useEffect, useMemo } from "react";
import PageMeta from "../../component/common/PageMeta";
import Select from "../../component/form/Select";
import useSeasonQuery from "../../features/season/hooks/useSeasonQuery";
import {
    useDashboardMetrics,
    useHarvestTrend,
    useHarvestByType,
    useBagangPerformance,
    useRecentSales,
} from "../../features/dashboard/hooks/useDashboard";
import DashboardMetricsCard from "./DashboardMetrics";
import HarvestTrendChart from "./HarvestTrendChart";
import HarvestByTypeChart from "./HarvestByTypeChart";
import BagangPerformanceChart from "./BagangPerformanceChart";
import RecentSalesTable from "./RecentSalesTable";

export default function DashboardPage() {
    const [selectedSeasonId, setSelectedSeasonId] = useState<number | undefined>(undefined);

    // Fetch seasons
    const { data: seasonsResponse, isLoading: isSeasonsLoading } = useSeasonQuery();
    const seasons = useMemo(
        () => seasonsResponse?.data?.data ?? [],
        [seasonsResponse],
    );

    // Set default to active season (end_date is null) or first season
    useEffect(() => {
        if (seasons.length > 0 && !selectedSeasonId) {
            const activeSeason = seasons.find((s) => !s.end_date || s.end_date === "");
            setSelectedSeasonId(activeSeason?.id ?? seasons[0].id);
        }
    }, [seasons, selectedSeasonId]);

    // Season options for dropdown
    const seasonOptions = useMemo(() => {
        return seasons.map((season) => {
            const startDate = new Date(season.start_date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
            });
            const isActive = !season.end_date || season.end_date === "";
            return {
                value: season.id.toString(),
                label: `${startDate}${isActive ? " (Aktif)" : ""}`,
            };
        });
    }, [seasons]);

    // Dashboard data queries
    const { data: metricsData, isLoading: isMetricsLoading } = useDashboardMetrics(selectedSeasonId);
    const { data: trendData, isLoading: isTrendLoading } = useHarvestTrend(selectedSeasonId);
    const { data: byTypeData, isLoading: isByTypeLoading } = useHarvestByType(selectedSeasonId);
    const { data: performanceData, isLoading: isPerformanceLoading } = useBagangPerformance(selectedSeasonId, 5);
    const { data: recentSalesData, isLoading: isRecentSalesLoading } = useRecentSales(5);

    const handleSeasonChange = (value: string) => {
        setSelectedSeasonId(parseInt(value, 10));
    };

    return (
        <>
            <PageMeta
                title="Dashboard | Catchery"
                description="Dashboard untuk manajemen Bagang"
            />

            <div className="space-y-6">
                {/* Header with Season Selector */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                            Dashboard
                        </h2>
                        <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                            Ringkasan performa bagang
                        </p>
                    </div>
                    <div className="w-full sm:w-64">
                        <Select
                            options={seasonOptions}
                            value={selectedSeasonId?.toString() ?? ""}
                            onChange={handleSeasonChange}
                            placeholder={isSeasonsLoading ? "Memuat..." : "Pilih Musim"}
                        />
                    </div>
                </div>

                {/* Metrics Cards */}
                <DashboardMetricsCard
                    data={metricsData?.data}
                    isLoading={isMetricsLoading || !selectedSeasonId}
                />

                {/* Charts Row 1: Trend + By Type */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <HarvestTrendChart
                        data={trendData?.data?.data}
                        isLoading={isTrendLoading || !selectedSeasonId}
                    />
                    <HarvestByTypeChart
                        data={byTypeData?.data?.data}
                        isLoading={isByTypeLoading || !selectedSeasonId}
                    />
                </div>

                {/* Charts Row 2: Bagang Performance */}
                <BagangPerformanceChart
                    data={performanceData?.data?.data}
                    isLoading={isPerformanceLoading || !selectedSeasonId}
                />

                {/* Recent Sales Table */}
                <RecentSalesTable
                    data={recentSalesData?.data?.data}
                    isLoading={isRecentSalesLoading}
                />
            </div>
        </>
    );
}
