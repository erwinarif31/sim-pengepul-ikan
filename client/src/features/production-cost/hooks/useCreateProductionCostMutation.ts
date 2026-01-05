import { useMutation, useQueryClient } from "@tanstack/react-query";
import ProductionCostService from "../api/production-cost.service";

const useCreateProductionCostMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => ProductionCostService.createProductionCost(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [ProductionCostService.queries.LIST],
            });
        },
    });
};

export default useCreateProductionCostMutation;
