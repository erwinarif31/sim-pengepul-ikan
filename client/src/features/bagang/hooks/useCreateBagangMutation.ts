import { useMutation, useQueryClient } from "@tanstack/react-query";
import BagangService from "../api/bagang.service";

const useCreateBagangMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => BagangService.createBagang(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [BagangService.queries.LIST],
            });
        },
    });
};

export default useCreateBagangMutation;
