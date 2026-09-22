import http from "../../../lib/http";
import { RequestArgs } from "../../../types/requestArgs";
import { ApiResponse } from "../../../types/response";
import { PayrollListResponse } from "./payroll.type";

class PayrollService {
    static readonly queries = {
        LIST: "payroll/list",
    };

    static async getAllPayrollRows(
        { signal }: RequestArgs,
    ): ApiResponse<PayrollListResponse> {
        return await http.get("/api/payroll", { signal });
    }

    static async generatePayrollPDF(workerID: string, bagangID: string, seasonID: number): Promise<Blob> {
        const response = await http.get(`/api/payroll/${workerID}`, {
            responseType: "blob",
            params: {
                bagangId: bagangID,
                seasonId: seasonID,
            },
        });
        return response.data;
    }
}

export default PayrollService;
