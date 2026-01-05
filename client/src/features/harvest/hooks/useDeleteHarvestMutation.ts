import { useMutation, useQueryClient } from "@tanstack/react-query";
import HarvestService from "../api/harvest.service";

const useDeleteHarvestMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => HarvestService.deleteHarvest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HarvestService.queries.LIST],
            });
        },
    });
};

export default useDeleteHarvestMutation;
