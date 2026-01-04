import { useQuery } from "@tanstack/react-query";
import { RequestArgs } from "../../../types/requestArgs";
import SalesService from "../api/sales.service";

const useSalesQuery = (args?: RequestArgs) => {
    return useQuery({
        queryKey: [SalesService.queries.LIST, args?.params],
        queryFn: ({ signal }) =>
            SalesService.getAllSales({ signal, params: args?.params }),
    });
};

export default useSalesQuery;
