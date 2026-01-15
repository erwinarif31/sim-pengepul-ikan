import { useQuery } from "@tanstack/react-query";
import DashboardService from "../api/dashboard.service";

export const useDashboardMetrics = (seasonId: number | undefined) => {
    return useQuery({
        queryKey: [DashboardService.queries.METRICS, seasonId],
        queryFn: ({ signal }) => DashboardService.getMetrics(seasonId!, signal),
        enabled: !!seasonId,
    });
};

export const useHarvestTrend = (seasonId: number | undefined) => {
    return useQuery({
        queryKey: [DashboardService.queries.HARVEST_TREND, seasonId],
        queryFn: ({ signal }) => DashboardService.getHarvestTrend(seasonId!, signal),
        enabled: !!seasonId,
    });
};

export const useHarvestByType = (seasonId: number | undefined) => {
    return useQuery({
        queryKey: [DashboardService.queries.HARVEST_BY_TYPE, seasonId],
        queryFn: ({ signal }) => DashboardService.getHarvestByType(seasonId!, signal),
        enabled: !!seasonId,
    });
};

export const useBagangPerformance = (seasonId: number | undefined, limit?: number) => {
    return useQuery({
        queryKey: [DashboardService.queries.BAGANG_PERFORMANCE, seasonId, limit],
        queryFn: ({ signal }) => DashboardService.getBagangPerformance(seasonId!, limit, signal),
        enabled: !!seasonId,
    });
};

export const useRecentSales = (limit?: number) => {
    return useQuery({
        queryKey: [DashboardService.queries.RECENT_SALES, limit],
        queryFn: ({ signal }) => DashboardService.getRecentSales(limit, signal),
    });
};
