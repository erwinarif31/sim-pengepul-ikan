import { useQuery } from "@tanstack/react-query";
import { RequestArgs } from "../../../types/requestArgs";
import CustomerService from "../api/customer.service";

const useCustomerQuery = (args?: RequestArgs) => {
    return useQuery({
        queryKey: [CustomerService.queries.LIST, args?.params],
        queryFn: ({ signal }) =>
            CustomerService.getAllCustomers({ signal, params: args?.params }),
    });
};

export default useCustomerQuery;
