import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import CustomerService from "../api/customer.service";

const useDeleteCustomerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => CustomerService.deleteCustomer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CustomerService.queries.LIST] });
            toast.success("Pelanggan berhasil dihapus");
        },
        onError: (error) => {
            toast.error(
                error instanceof Error ? error.message : "Gagal menghapus pelanggan",
            );
        },
    });
};

export default useDeleteCustomerMutation;
