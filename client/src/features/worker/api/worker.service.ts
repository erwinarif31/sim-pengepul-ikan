import http from "../../../lib/http";
import { RequestArgs } from "../../../types/requestArgs";
import { ApiResponse } from "../../../types/response";
import { WorkerResponse } from "./worker.type";

const baseQueries = {
    INDEX: "worker/index",
    LIST: "worker/list",
    DETAIL: "worker/detail",
};

class WorkerService {
    static readonly queries = { ...baseQueries };

    static async getAllWorkers(
        { signal, params }: RequestArgs,
    ): ApiResponse<WorkerResponse["list"]> {
        return await http.get("/api/workers", { signal, params });
    }
}

export default WorkerService;
