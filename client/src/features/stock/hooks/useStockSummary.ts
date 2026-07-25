import { useQuery } from "@tanstack/react-query";
import StockService from "../api/stock.service";
import type { StockSummaryQuery } from "../api/stock.type";

const useStockSummary = (params: StockSummaryQuery | undefined) => {
    return useQuery({
        queryKey: ["stock/summary", params],
        queryFn: ({ signal }) => StockService.getSummary(params!, signal),
        enabled: Boolean(params?.seasonId),
    });
};

export default useStockSummary;
