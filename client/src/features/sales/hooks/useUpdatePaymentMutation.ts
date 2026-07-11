import { useMutation, useQueryClient } from "@tanstack/react-query";
import SalesService from "../api/sales.service";

const useUpdatePaymentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            SalesService.updatePayment(id, data),
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

export default useUpdatePaymentMutation;
