import { useQuery } from "@tanstack/react-query";
import WorkerService from "../api/worker.service";

const useWorkerDetail = (id: string) => {
    return useQuery({
        queryKey: [WorkerService.queries.DETAIL, id],
        queryFn: () => WorkerService.getWorkerById(id),
        enabled: !!id,
    });
};

export default useWorkerDetail;
