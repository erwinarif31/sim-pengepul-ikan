import { useQuery } from "@tanstack/react-query";
import { RequestArgs } from "../../../types/requestArgs";
import ProductionCostService from "../api/production-cost.service";

const useProductionCostsQuery = (bagangId: string, args?: RequestArgs) => {
    return useQuery({
        queryKey: [ProductionCostService.queries.LIST, bagangId, args?.params],
        queryFn: ({ signal }) =>
            ProductionCostService.getProductionCostsByBagangId(bagangId, {
                signal,
                params: args?.params,
            }),
        enabled: !!bagangId,
    });
};

export default useProductionCostsQuery;
