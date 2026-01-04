import { RequestArgs } from "../../../types/requestArgs";
import parsedResponse from "../../../utils/parsedResponse";
import HarvestService from "../api/harvest.service";
import { useQuery } from "@tanstack/react-query";

const { INDEX, LIST } = HarvestService.queries;

const useGetAllHarvest = (id: string, args?: RequestArgs) => {
    const { params, queryKeys } = args ?? {};

    return useQuery({
        queryKey: [INDEX, LIST, id, ...(queryKeys ?? [])], // Include id in queryKey
        queryFn: ({ signal }) =>
            HarvestService.getAllHarvest({ params, signal }, id),
        select: parsedResponse,
        enabled: !!id, // Disable query if id is not provided
    });
};

export default useGetAllHarvest;
