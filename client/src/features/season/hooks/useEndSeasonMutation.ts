import { useMutation, useQueryClient } from "@tanstack/react-query";
import SeasonService from "../api/season.service";

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

export default useEndSeasonMutation;
