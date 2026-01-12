import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import CustomerService from "../api/customer.service";
import { UpdateCustomerRequest } from "../api/customer.type";

const useUpdateCustomerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCustomerRequest }) =>
            CustomerService.updateCustomer(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CustomerService.queries.LIST] });
            toast.success("Pelanggan berhasil diperbarui");
        },
        onError: (error) => {
            toast.error(
                error instanceof Error ? error.message : "Gagal memperbarui pelanggan",
            );
        },
    });
};

export default useUpdateCustomerMutation;
