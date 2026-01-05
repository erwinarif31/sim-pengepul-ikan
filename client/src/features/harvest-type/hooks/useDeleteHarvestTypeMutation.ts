import { useMutation, useQueryClient } from "@tanstack/react-query";
import HarvestTypeService from "../api/harvest-type.service";

const useDeleteHarvestTypeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (name: string) => HarvestTypeService.deleteHarvestType(name),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HarvestTypeService.queries.LIST],
            });
        },
    });
};

export default useDeleteHarvestTypeMutation;
