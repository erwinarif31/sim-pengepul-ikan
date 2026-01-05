import { useMutation, useQueryClient } from "@tanstack/react-query";
import BagangService from "../api/bagang.service";

const useDeleteBagangMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => BagangService.deleteBagang(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [BagangService.queries.LIST],
            });
        },
    });
};

export default useDeleteBagangMutation;
