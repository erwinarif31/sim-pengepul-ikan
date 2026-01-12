import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import CustomerService from "../api/customer.service";
import { CreateCustomerRequest } from "../api/customer.type";

const useCreateCustomerMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCustomerRequest) => CustomerService.createCustomer(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CustomerService.queries.LIST] });
            toast.success("Pelanggan berhasil dibuat");
        },
        onError: (error) => {
            toast.error(
                error instanceof Error ? error.message : "Gagal membuat pelanggan",
            );
        },
    });
};

export default useCreateCustomerMutation;
