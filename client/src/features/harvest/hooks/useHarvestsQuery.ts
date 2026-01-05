import { useQuery } from "@tanstack/react-query";
import { RequestArgs } from "../../../types/requestArgs";
import HarvestService from "../api/harvest.service";

const useHarvestsQuery = (bagangId: string, args?: RequestArgs) => {
    return useQuery({
        queryKey: [HarvestService.queries.LIST, bagangId, args?.params],
        queryFn: ({ signal }) =>
            HarvestService.getHarvestsByBagangId(bagangId, {
                signal,
                params: args?.params,
            }),
        enabled: !!bagangId,
    });
};

export default useHarvestsQuery;
