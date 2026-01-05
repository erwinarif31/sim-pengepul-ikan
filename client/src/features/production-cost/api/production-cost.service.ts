import http from "../../../lib/http";
import { RequestArgs } from "../../../types/requestArgs";
import { ApiResponse } from "../../../types/response";
import { ProductionCostResponse } from "./production-cost.type";

const baseQueries = {
    INDEX: "production-cost/index",
    LIST: "production-cost/list",
    DETAIL: "production-cost/detail",
};

class ProductionCostService {
    static readonly queries = { ...baseQueries };

    static async getProductionCostsByBagangId(
        bagangId: string,
        { signal, params }: RequestArgs,
    ): ApiResponse<ProductionCostResponse["list"]> {
        return await http.get(`/api/bagang/${bagangId}/production-costs`, {
            signal,
            params,
        });
    }

    static async createProductionCost(
        data: any,
    ): ApiResponse<ProductionCostResponse["detail"]> {
        return await http.post("/api/production-costs", data);
    }

    static async updateProductionCost(
        id: string,
        data: any,
    ): ApiResponse<ProductionCostResponse["detail"]> {
        return await http.put(`/api/production-costs/${id}`, data);
    }

    static async deleteProductionCost(id: string): ApiResponse<boolean> {
        return await http.delete(`/api/production-costs/${id}`);
    }
}

export default ProductionCostService;
