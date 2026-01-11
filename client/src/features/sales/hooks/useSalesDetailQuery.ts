import { useQuery } from "@tanstack/react-query";
import SalesService from "../api/sales.service";

const useSalesDetailQuery = (id: string) => {
    return useQuery({
        queryKey: [SalesService.queries.DETAIL, id],
        queryFn: () => SalesService.getSalesById(id),
        enabled: !!id,
    });
};

export default useSalesDetailQuery;
