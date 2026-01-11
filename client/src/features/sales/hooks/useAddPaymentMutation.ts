import { useMutation, useQueryClient } from "@tanstack/react-query";
import SalesService from "../api/sales.service";

const useAddPaymentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            SalesService.addPayment(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [SalesService.queries.DETAIL, variables.id],
            });
            queryClient.invalidateQueries({
                queryKey: [SalesService.queries.LIST],
            });
        },
    });
};

export default useAddPaymentMutation;
