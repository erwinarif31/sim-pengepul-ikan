import http from "../../../lib/http";
import type {
    DashboardMetrics,
    HarvestTrendResponse,
    HarvestByTypeResponse,
    BagangPerformanceResponse,
    RecentSalesResponse,
    DashboardApiResponse,
} from "./dashboard.types";

const baseQueries = {
    METRICS: "dashboard/metrics",
    HARVEST_TREND: "dashboard/harvest-trend",
    HARVEST_BY_TYPE: "dashboard/harvest-by-type",
    BAGANG_PERFORMANCE: "dashboard/bagang-performance",
    RECENT_SALES: "dashboard/recent-sales",
};

class DashboardService {
    static readonly queries = { ...baseQueries };

    static async getMetrics(
        seasonId: number,
        signal?: AbortSignal
    ): Promise<DashboardApiResponse<DashboardMetrics>> {
        const response = await http.get("/api/dashboard/metrics", {
            params: { seasonId },
            signal,
        });
        return response.data;
    }

    static async getHarvestTrend(
        seasonId: number,
        signal?: AbortSignal
    ): Promise<DashboardApiResponse<HarvestTrendResponse>> {
        const response = await http.get("/api/dashboard/harvest-trend", {
            params: { seasonId },
            signal,
        });
        return response.data;
    }

    static async getHarvestByType(
        seasonId: number,
        signal?: AbortSignal
    ): Promise<DashboardApiResponse<HarvestByTypeResponse>> {
        const response = await http.get("/api/dashboard/harvest-by-type", {
            params: { seasonId },
            signal,
        });
        return response.data;
    }

    static async getBagangPerformance(
        seasonId: number,
        limit?: number,
        signal?: AbortSignal
    ): Promise<DashboardApiResponse<BagangPerformanceResponse>> {
        const response = await http.get("/api/dashboard/bagang-performance", {
            params: { seasonId, limit },
            signal,
        });
        return response.data;
    }

    static async getRecentSales(
        seasonId: number,
        limit?: number,
        signal?: AbortSignal
    ): Promise<DashboardApiResponse<RecentSalesResponse>> {
        const response = await http.get("/api/dashboard/recent-sales", {
            params: { seasonId, limit },
            signal,
        });
        return response.data;
    }
}

export default DashboardService;
