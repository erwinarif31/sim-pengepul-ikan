import { useMutation, useQueryClient } from "@tanstack/react-query";
import ProductionCostTypeService from "../api/production-cost-type.service";

const useCreateProductionCostTypeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string }) =>
            ProductionCostTypeService.createProductionCostType(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [ProductionCostTypeService.queries.LIST],
            });
        },
    });
};

export default useCreateProductionCostTypeMutation;
