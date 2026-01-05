import { useMutation, useQueryClient } from "@tanstack/react-query";
import HarvestTypeService from "../api/harvest-type.service";

const useCreateHarvestTypeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string }) =>
            HarvestTypeService.createHarvestType(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [HarvestTypeService.queries.LIST],
            });
        },
    });
};

export default useCreateHarvestTypeMutation;
