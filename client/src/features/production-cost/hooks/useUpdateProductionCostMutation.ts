import { useMutation, useQueryClient } from "@tanstack/react-query";
import ProductionCostService from "../api/production-cost.service";

const useUpdateProductionCostMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            ProductionCostService.updateProductionCost(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [ProductionCostService.queries.LIST],
            });
        },
    });
};

export default useUpdateProductionCostMutation;
