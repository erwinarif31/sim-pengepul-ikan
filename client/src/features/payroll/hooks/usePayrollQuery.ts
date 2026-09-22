import { useQuery } from "@tanstack/react-query";
import PayrollService from "../api/payroll.service";

const usePayrollQuery = () => {
    return useQuery({
        queryKey: [PayrollService.queries.LIST],
        queryFn: ({ signal }) => PayrollService.getAllPayrollRows({ signal }),
    });
};

export default usePayrollQuery;
