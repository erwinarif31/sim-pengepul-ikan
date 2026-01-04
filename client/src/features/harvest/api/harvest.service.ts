import http from "../../../lib/http";
import { RequestArgs } from "../../../types/requestArgs";
import { ApiResponse } from "../../../types/response";
import { HarvestResponse } from "./harvest.type";

const baseQueries = {
    INDEX: "harvest/index",
    LIST: "harvest/list",
    DETAIL: "harvest/detail",
};

class HarvestService {
    static readonly queries = { ...baseQueries };

    static async getAllHarvest(
        { signal, params }: RequestArgs, id: string
    ): ApiResponse<HarvestResponse["list"]> {
        return await http.get(`/harvests/${id}`, { signal, params });
    }
}

export default HarvestService;
