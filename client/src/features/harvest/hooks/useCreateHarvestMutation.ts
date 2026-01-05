import { useMutation, useQueryClient } from "@tanstack/react-query";
import HarvestService from "../api/harvest.service";

const useCreateHarvestMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => HarvestService.createHarvest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HarvestService.queries.LIST],
            });
        },
    });
};

export default useCreateHarvestMutation;
