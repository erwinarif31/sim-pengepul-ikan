import { useQuery } from "@tanstack/react-query";
import { RequestArgs } from "../../../types/requestArgs";
import BagangService from "../api/bagang.service";

const useBagangQuery = (args?: RequestArgs) => {
    return useQuery({
        queryKey: [BagangService.queries.LIST, args?.params],
        queryFn: ({ signal }) =>
            BagangService.getAllBagangs({ signal, params: args?.params }),
    });
};

export default useBagangQuery;
