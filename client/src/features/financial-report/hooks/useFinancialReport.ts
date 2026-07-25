import { useQuery } from "@tanstack/react-query";
import FinancialReportService from "../api/financial-report.service";
import type { FinancialReportQuery } from "../api/financial-report.type";

const useFinancialReport = (params: FinancialReportQuery | undefined) => {
    return useQuery({
        queryKey: ["reports/financial", params],
        queryFn: ({ signal }) => FinancialReportService.getReport(params!, signal),
        enabled: Boolean(params?.seasonId),
    });
};

export default useFinancialReport;
