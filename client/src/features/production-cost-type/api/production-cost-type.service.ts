import http from "../../../lib/http";
import { RequestArgs } from "../../../types/requestArgs";
import { ApiResponse } from "../../../types/response";
import { ProductionCostTypeResponse } from "./production-cost-type.type";

const baseQueries = {
    INDEX: "production-cost-type/index",
    LIST: "production-cost-type/list",
    DETAIL: "production-cost-type/detail",
};

class ProductionCostTypeService {
    static readonly queries = { ...baseQueries };

    static async getAllProductionCostTypes(
        { signal, params }: RequestArgs,
    ): ApiResponse<ProductionCostTypeResponse["list"]> {
        return await http.get("/api/production-cost-types", { signal, params });
    }
}

export default ProductionCostTypeService;
