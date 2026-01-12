import http from "../../../lib/http";

class PayrollService {
    static async generatePayrollPDF(workerID: string): Promise<Blob> {
        // We use responseType: 'blob' to handle binary data
        const response = await http.get(`/api/payroll/${workerID}`, {
            responseType: "blob",
        });
        // http.get usually returns ApiResponse or AxiosResponse.
        // Assuming custom http lib wrapper returns data directly or we need to access underlying axios response.
        // If http.get returns { data, ... }, we need to check how it handles blob.
        // Standard axios returns data in response.data.
        return response as unknown as Blob;
    }
}

export default PayrollService;
