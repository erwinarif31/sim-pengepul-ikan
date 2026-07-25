import http from "../../../lib/http";
import type {
    StockSummaryApiResponse,
    StockSummaryQuery,
} from "./stock.type";

class StockService {
    static async getSummary(
        params: StockSummaryQuery,
        signal?: AbortSignal,
    ): Promise<StockSummaryApiResponse> {
        const response = await http.get("/api/stock/summary", { params, signal });
        return response.data;
    }
}

export default StockService;
