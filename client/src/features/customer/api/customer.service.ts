import http from "../../../lib/http";
import { RequestArgs } from "../../../types/requestArgs";
import { ApiResponse } from "../../../types/response";
import {
    CreateCustomerRequest,
    CustomerResponse,
    UpdateCustomerRequest,
} from "./customer.type";

const baseQueries = {
    LIST: "customer/list",
    DETAIL: "customer/detail",
};

class CustomerService {
    static readonly queries = { ...baseQueries };

    static async getAllCustomers(
        { signal, params }: RequestArgs,
    ): ApiResponse<CustomerResponse["list"]> {
        return await http.get("/api/customers", { signal, params });
    }

    static async getCustomerById(id: string): ApiResponse<CustomerResponse["detail"]> {
        return await http.get(`/api/customers/${id}`);
    }

    static async createCustomer(
        data: CreateCustomerRequest,
    ): ApiResponse<CustomerResponse["detail"]> {
        return await http.post("/api/customers", data);
    }

    static async updateCustomer(
        id: string,
        data: UpdateCustomerRequest,
    ): ApiResponse<CustomerResponse["detail"]> {
        return await http.put(`/api/customers/${id}`, data);
    }

    static async deleteCustomer(id: string): ApiResponse<boolean> {
        return await http.delete(`/api/customers/${id}`);
    }
}

export default CustomerService;
