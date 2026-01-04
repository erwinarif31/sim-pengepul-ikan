import { AnyResponseType, AxiosInstanceResponse } from "../types/response";

const parseResponse = <T extends AnyResponseType>(
    response?: AxiosInstanceResponse<T>,
): T | null => {
    if (!response) {
        return null;
    }

    return response.data;
};

export default parseResponse;
