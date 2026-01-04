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
        return await http.get("/api/seasons", { signal, params });
    }

    static async endCurrentSeason(): ApiResponse<string> {
        return await http.post("/api/seasons/end");
    }
}

export default SeasonService;