import { RequestArgs } from "../../../types/requestArgs";
import parsedResponse from "../../../utils/parsedResponse";
import BagangService from "../api/bagang.service";
import { useQuery } from "@tanstack/react-query";

const { INDEX, LIST } = BagangService.queries; // Use query keys from your service

const useGetAllBagangs = (args?: RequestArgs) => {
    const { params, queryKeys } = args ?? {};

    return useQuery({
        queryKey: [INDEX, LIST, ...(queryKeys ?? [])], // Unique key for caching
        queryFn: ({ signal }) =>
            BagangService.getAllBagangs({ params, signal }),
        // Optional: Transform the response data
        select: parsedResponse,
    });
};

export default useGetAllBagangs;
