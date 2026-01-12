import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import SalesService from "../api/sales.service";

const useCreateSalesMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { customer: string }) => SalesService.createSales(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SalesService.queries.LIST] });
            toast.success("Penjualan berhasil dibuat");
        },
        onError: (error) => {
            toast.error(
                error instanceof Error ? error.message : "Gagal membuat penjualan",
            );
        },
    });
};

export default useCreateSalesMutation;
