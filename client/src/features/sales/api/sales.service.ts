import http from "../../../lib/http";
import { RequestArgs } from "../../../types/requestArgs";
import { ApiResponse } from "../../../types/response";
import { SalesResponse } from "./sales.type";

const baseQueries = {
    INDEX: "sales/index",
    LIST: "sales/list",
    DETAIL: "sales/detail",
};

class SalesService {
    static readonly queries = { ...baseQueries };

    static async getAllSales(
        { signal, params }: RequestArgs,
    ): ApiResponse<SalesResponse["list"]> {
        return await http.get("/api/sales", { signal, params });
    }

    static async getSalesById(id: string): ApiResponse<SalesResponse["detail"]> {
        return await http.get(`/api/sales/${id}`);
    }

    static async createSales(
        data: { customer: string; bagang_id: string },
    ): ApiResponse<SalesResponse["detail"]> {
        return await http.post("/api/sales", data);
    }

    static async addSalesItem(
        id: string,
        data: any,
    ): ApiResponse<SalesResponse["detail"]> {
        return await http.post(`/api/sales/${id}/items`, data);
    }

    static async addPayment(
        id: string,
        data: any,
    ): ApiResponse<SalesResponse["detail"]> {
        return await http.post(`/api/sales/${id}/payments`, data);
    }

    static async updateSalesItem(
        itemId: number,
        data: any,
    ): ApiResponse<SalesResponse["detail"]> {
        return await http.put(`/api/sales/items/${itemId}`, data);
    }

    static async deleteSalesItem(
        itemId: number,
    ): ApiResponse<SalesResponse["detail"]> {
        return await http.delete(`/api/sales/items/${itemId}`);
    }

    static async updatePayment(
        paymentId: number,
        data: any,
    ): ApiResponse<SalesResponse["detail"]> {
        return await http.put(`/api/sales/payments/${paymentId}`, data);
    }

    static async deletePayment(
        paymentId: number,
    ): ApiResponse<SalesResponse["detail"]> {
        return await http.delete(`/api/sales/payments/${paymentId}`);
    }
}

export default SalesService;
