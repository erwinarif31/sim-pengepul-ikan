import http from "../../../lib/http";
import { RequestArgs } from "../../../types/requestArgs";
import { ApiResponse } from "../../../types/response";
import { SalesResponse } from "./sales.type";

const baseQueries = {
    INDEX: "sales/index",
    LIST: "sales/list",
    DETAIL: "sales/detail",
};

class SalesService {
    static readonly queries = { ...baseQueries };

    static async getAllSales(
        { signal, params }: RequestArgs,
    ): ApiResponse<SalesResponse["list"]> {
        return await http.get("/api/harvests", { signal, params });
    }
}

export default SalesService;
