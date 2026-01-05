import { useMutation, useQueryClient } from "@tanstack/react-query";
import HarvestService from "../api/harvest.service";

const useUpdateHarvestMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            HarvestService.updateHarvest(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HarvestService.queries.LIST],
            });
        },
    });
};

export default useUpdateHarvestMutation;
