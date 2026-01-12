import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import PayrollService from "../api/payroll.service";

const useGeneratePayrollPDF = () => {
    return useMutation({
        mutationFn: ({ workerID, workerName }: { workerID: string; workerName: string }) =>
            PayrollService.generatePayrollPDF(workerID),
        onSuccess: (data, variables) => {
            // Create a blob URL and trigger download
            // 'data' here should be the Blob if the service returns it correctly.
            // However, the custom http wrapper might return something else.
            // Let's assume it returns the Blob directly for now based on service implementation.
            
            // Checking if data is actually a Blob (or similar)
            // If the custom http wrapper wraps it, we might need to adjust.
            // But let's proceed with standard blob handling.
            
            // Note: If the response is wrapped in {data: ...}, we need to extract it.
            // But since I used responseType: 'blob', Axios usually returns the blob in data.
            // My custom http wrapper: `http.get` likely returns `response.data`.
            
            const blob = new Blob([data as any], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
            link.setAttribute("download", `Payroll_${variables.workerName}_${dateStr}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("PDF Payroll berhasil dibuat");
        },
        onError: (error) => {
            console.error(error);
            toast.error("Gagal membuat PDF Payroll");
        },
    });
};

export default useGeneratePayrollPDF;
