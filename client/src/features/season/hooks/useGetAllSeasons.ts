import { RequestArgs } from "../../../types/requestArgs";
import parsedResponse from "../../../utils/parsedResponse";
import SeasonService from "../api/season.service";
import { useQuery } from "@tanstack/react-query";

const { INDEX, LIST } = SeasonService.queries; // Use query keys from your service

const useGetAllSeasons = (args?: RequestArgs) => {
    const { params, queryKeys } = args ?? {};

    return useQuery({
        queryKey: [INDEX, LIST, ...(queryKeys ?? [])], // Unique key for caching
        queryFn: ({ signal }) =>
            SeasonService.getAllSeasons({ params, signal }),
        // Optional: Transform the response data
        select: parsedResponse,
    });
};

export default useGetAllSeasons;
