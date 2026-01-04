import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RequestArgs } from "../../../types/requestArgs";
import SeasonService from "../api/season.service";

const useSeasonQuery = (args?: RequestArgs) => {
    return useQuery({
        queryKey: [SeasonService.queries.LIST, args?.params],
        queryFn: ({ signal }) =>
            SeasonService.getAllSeasons({ signal, params: args?.params }),
    });
};

const useEndSeasonMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => SeasonService.endCurrentSeason(),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [SeasonService.queries.LIST],
            });
        },
    });
};

export { useEndSeasonMutation };
export default useSeasonQuery;
