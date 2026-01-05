import { useMutation, useQueryClient } from "@tanstack/react-query";
import ProductionCostService from "../api/production-cost.service";

const useDeleteProductionCostMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => ProductionCostService.deleteProductionCost(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [ProductionCostService.queries.LIST],
            });
        },
    });
};

export default useDeleteProductionCostMutation;
