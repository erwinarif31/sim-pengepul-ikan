import { useMutation, useQueryClient } from "@tanstack/react-query";
import WorkerService from "../api/worker.service";

const useDeleteWorkerMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => WorkerService.deleteWorker(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [WorkerService.queries.LIST],
            });
        },
    });
};

export default useDeleteWorkerMutation;
