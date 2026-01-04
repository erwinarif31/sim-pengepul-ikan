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
        // Replace '/[feature]' with your actual API endpoint
        return await http.get("/api/bagang", { signal, params });
    }

    // Add other GET methods as needed (e.g., get[Feature]ById)
}

export default BagangService;
