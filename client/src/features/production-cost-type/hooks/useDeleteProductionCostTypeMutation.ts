import { useMutation, useQueryClient } from "@tanstack/react-query";
import ProductionCostTypeService from "../api/production-cost-type.service";

const useDeleteProductionCostTypeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (name: string) =>
            ProductionCostTypeService.deleteProductionCostType(name),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [ProductionCostTypeService.queries.LIST],
            });
        },
    });
};

export default useDeleteProductionCostTypeMutation;
