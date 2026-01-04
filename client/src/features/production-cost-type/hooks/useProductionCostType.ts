import { useQuery } from "@tanstack/react-query";
import { RequestArgs } from "../../../types/requestArgs";
import ProductionCostTypeService from "../api/production-cost-type.service";

const useProductionCostTypeQuery = (args?: RequestArgs) => {
    return useQuery({
        queryKey: [ProductionCostTypeService.queries.LIST, args?.params],
        queryFn: ({ signal }) =>
            ProductionCostTypeService.getAllProductionCostTypes({
                signal,
                params: args?.params,
            }),
    });
};

export default useProductionCostTypeQuery;
