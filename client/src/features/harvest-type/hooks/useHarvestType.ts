import { useQuery } from "@tanstack/react-query";
import { RequestArgs } from "../../../types/requestArgs";
import HarvestTypeService from "../api/harvest-type.service";

const useHarvestTypeQuery = (args?: RequestArgs) => {
    return useQuery({
        queryKey: [HarvestTypeService.queries.LIST, args?.params],
        queryFn: ({ signal }) =>
            HarvestTypeService.getAllHarvestTypes({
                signal,
                params: args?.params,
            }),
    });
};

export default useHarvestTypeQuery;
