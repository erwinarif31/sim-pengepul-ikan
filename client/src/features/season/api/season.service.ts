import http from "../../../lib/http";
import { RequestArgs } from "../../../types/requestArgs";
import { ApiResponse } from "../../../types/response";
import { SeasonResponse } from "./season.type";

const baseQueries = {
    INDEX: "season/index",
    LIST: "season/list",
    DETAIL: "season/detail",
};

class SeasonService {
    static readonly queries = { ...baseQueries };

    static async getAllSeasons(
        { signal, params }: RequestArgs,
    ): ApiResponse<SeasonResponse["list"]> {
        // Replace '/[feature]' with your actual API endpoint
        return await http.get("/seasons/all", { signal, params });
    }

    // Add other GET methods as needed (e.g., get[Feature]ById)
}

export default SeasonService;
