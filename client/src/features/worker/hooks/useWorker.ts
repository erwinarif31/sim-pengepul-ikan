import { useQuery } from "@tanstack/react-query";
import { RequestArgs } from "../../../types/requestArgs";
import WorkerService from "../api/worker.service";

const useWorkerQuery = (args?: RequestArgs) => {
    return useQuery({
        queryKey: [WorkerService.queries.LIST, args?.params],
        queryFn: ({ signal }) =>
            WorkerService.getAllWorkers({ signal, params: args?.params }),
    });
};

export default useWorkerQuery;
