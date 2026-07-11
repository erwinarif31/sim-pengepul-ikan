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

    static async getHarvestsByBagangId(
        bagangId: string,
        { signal, params }: RequestArgs,
    ): ApiResponse<HarvestResponse["list"]> {
        return await http.get(`/api/bagang/${bagangId}/harvests`, {
            signal,
            params,
        });
    }

    static async getAllHarvest(
        args: RequestArgs,
        bagangId: string,
    ): ApiResponse<HarvestResponse["list"]> {
        return await this.getHarvestsByBagangId(bagangId, args);
    }

    static async createHarvest(data: any): ApiResponse<HarvestResponse["detail"]> {
        return await http.post("/api/harvests", data);
    }

    static async updateHarvest(
        id: string,
        data: any,
    ): ApiResponse<HarvestResponse["detail"]> {
        return await http.put(`/api/harvests/${id}`, data);
    }

    static async deleteHarvest(id: string): ApiResponse<boolean> {
        return await http.delete(`/api/harvests/${id}`);
    }
}

export default HarvestService;
