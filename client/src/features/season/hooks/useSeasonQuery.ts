import { useQuery } from "@tanstack/react-query";
import { RequestArgs } from "../../../types/requestArgs";
import SeasonService from "../api/season.service";

const useSeasonQuery = (args?: RequestArgs) => {
    return useQuery({
        queryKey: [SeasonService.queries.LIST, args?.params],
        queryFn: ({ signal }) =>
            SeasonService.getAllSeasons({ signal, params: args?.params }),
    });
};

export default useSeasonQuery;
