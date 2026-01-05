import { useMutation, useQueryClient } from "@tanstack/react-query";
import BagangService from "../api/bagang.service";

const useUpdateBagangMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            BagangService.updateBagang(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [BagangService.queries.LIST],
            });
        },
    });
};

export default useUpdateBagangMutation;
