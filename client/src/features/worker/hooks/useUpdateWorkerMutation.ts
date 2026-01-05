import { useMutation, useQueryClient } from "@tanstack/react-query";
import WorkerService from "../api/worker.service";

const useUpdateWorkerMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
            WorkerService.updateWorker(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [WorkerService.queries.LIST],
            });
        },
    });
};

export default useUpdateWorkerMutation;
