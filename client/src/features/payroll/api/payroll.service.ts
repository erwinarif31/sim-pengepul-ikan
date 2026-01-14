import http from "../../../lib/http";

class PayrollService {
    static async generatePayrollPDF(workerID: string, bagangID?: string): Promise<Blob> {
        // We use responseType: 'blob' to handle binary data
        const response = await http.get(`/api/payroll/${workerID}`, {
            responseType: "blob",
            params: {
                bagangId: bagangID
            }
        });
        return response.data;
    }
}

export default PayrollService;
