import { RequestArgs } from "../../../types/requestArgs";
import parsedResponse from "../../../utils/parsedResponse";
import SeasonService from "../api/season.service";
import { useQuery } from "@tanstack/react-query";

const { LIST } = SeasonService.queries;

const useGetAllSeasons = (args?: RequestArgs) => {
    const { params, queryKeys } = args ?? {};

    return useQuery({
        queryKey: [LIST, params, ...(queryKeys ?? [])],
        queryFn: ({ signal }) =>
            SeasonService.getAllSeasons({ params, signal }),
        // Optional: Transform the response data
        select: parsedResponse,
    });
};

export default useGetAllSeasons;
