import http from "../../../lib/http";
import { RequestArgs } from "../../../types/requestArgs";
import { ApiResponse } from "../../../types/response";
import { BagangResponse } from "./bagang.type";

const baseQueries = {
    INDEX: "bagang/index",
    LIST: "bagang/list",
    DETAIL: "bagang/detail",
};

class BagangService {
    static readonly queries = { ...baseQueries };

    static async getAllBagangs(
        { signal, params }: RequestArgs,
    ): ApiResponse<BagangResponse["list"]> {
        return await http.get("/api/bagang", { signal, params });
    }

    static async getBagangById(id: string): ApiResponse<BagangResponse["detail"]> {
        return await http.get(`/api/bagang/${id}`);
    }

    static async createBagang(data: any): ApiResponse<BagangResponse["detail"]> {
        return await http.post("/api/bagang", data);
    }

    static async updateBagang(
        id: string,
        data: any,
    ): ApiResponse<BagangResponse["detail"]> {
        return await http.put(`/api/bagang/${id}`, data);
    }

    static async deleteBagang(id: string): ApiResponse<boolean> {
        return await http.delete(`/api/bagang/${id}`);
    }
}

export default BagangService;
