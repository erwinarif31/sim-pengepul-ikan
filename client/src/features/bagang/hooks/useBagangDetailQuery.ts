import { useQuery } from "@tanstack/react-query";
import BagangService from "../api/bagang.service";

const useBagangDetailQuery = (id: string) => {
    return useQuery({
        queryKey: [BagangService.queries.DETAIL, id],
        queryFn: () => BagangService.getBagangById(id),
        enabled: !!id,
    });
};

export default useBagangDetailQuery;
