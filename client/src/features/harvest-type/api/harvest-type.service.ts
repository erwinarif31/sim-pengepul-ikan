import http from "../../../lib/http";
import { RequestArgs } from "../../../types/requestArgs";
import { ApiResponse } from "../../../types/response";
import { HarvestTypeResponse } from "./harvest-type.type";

const baseQueries = {
    INDEX: "harvest-type/index",
    LIST: "harvest-type/list",
    DETAIL: "harvest-type/detail",
};

class HarvestTypeService {
    static readonly queries = { ...baseQueries };

    static async getAllHarvestTypes(
        { signal, params }: RequestArgs,
    ): ApiResponse<HarvestTypeResponse["list"]> {
        return await http.get("/api/harvest-types", { signal, params });
    }
}

export default HarvestTypeService;
