import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import PayrollService from "../api/payroll.service";

const useGeneratePayrollPDF = () => {
    return useMutation({
        mutationFn: ({ workerID, bagangID }: { workerID: string; workerName: string; bagangID?: string }) =>
            PayrollService.generatePayrollPDF(workerID, bagangID),
        onSuccess: (data, variables) => {
            // Create a blob URL and trigger download
            // 'data' here is the Blob because the service returns response.data
            
            const url = window.URL.createObjectURL(data);
            const link = document.createElement("a");
            link.href = url;
            const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
            link.setAttribute("download", `Payroll_${variables.workerName}_${dateStr}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("PDF Payroll berhasil dibuat");
        },
        onError: (error) => {
            console.error(error);
            toast.error("Gagal membuat PDF Payroll");
        },
    });
};

export default useGeneratePayrollPDF;
