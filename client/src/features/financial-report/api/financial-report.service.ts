import http from "../../../lib/http";
import type {
    FinancialReportApiResponse,
    FinancialReportQuery,
} from "./financial-report.type";

class FinancialReportService {
    static async getReport(
        params: FinancialReportQuery,
        signal?: AbortSignal,
    ): Promise<FinancialReportApiResponse> {
        const response = await http.get("/api/reports/financial", { params, signal });
        return response.data;
    }
}

export default FinancialReportService;
