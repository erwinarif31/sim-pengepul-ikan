import { useMutation, useQueryClient } from "@tanstack/react-query";
import WorkerService from "../api/worker.service";

const useCreateWorkerMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string }) => WorkerService.createWorker(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [WorkerService.queries.LIST],
            });
        },
    });
};

export default useCreateWorkerMutation;
