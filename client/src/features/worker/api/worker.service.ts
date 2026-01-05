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

    static async getWorkerById(id: string): ApiResponse<WorkerResponse["detail"]> {
        return await http.get(`/api/workers/${id}`);
    }

    static async createWorker(
        data: { name: string },
    ): ApiResponse<WorkerResponse["detail"]> {
        return await http.post("/api/workers", data);
    }

    static async updateWorker(
        id: string,
        data: { name: string },
    ): ApiResponse<WorkerResponse["detail"]> {
        return await http.put(`/api/workers/${id}`, data);
    }

    static async deleteWorker(id: string): ApiResponse<boolean> {
        return await http.delete(`/api/workers/${id}`);
    }
}

export default WorkerService;
