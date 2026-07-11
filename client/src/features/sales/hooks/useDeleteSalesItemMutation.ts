import { useMutation, useQueryClient } from "@tanstack/react-query";
import SalesService from "../api/sales.service";

const useDeleteSalesItemMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => SalesService.deleteSalesItem(id),
        onSuccess: (response) => {
            queryClient.invalidateQueries({
                queryKey: [
                    SalesService.queries.DETAIL,
                    response.data.data.id.toString(),
                ],
            });
            queryClient.invalidateQueries({
                queryKey: [SalesService.queries.LIST],
            });
        },
    });
};

export default useDeleteSalesItemMutation;
