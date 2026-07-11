import type { AxiosError } from "axios";

type AnyResponseType = unknown;

interface AxiosInstanceResponse<T = AnyResponseType> {
    data: T;
    status: number;
    headers?: Record<string, unknown>;
}

type ApiResponse<T = AnyResponseType> = Promise<AxiosInstanceResponse<T>>;

interface MutationCallbackArgs<T = AnyResponseType> {
    onSuccess?: (response: AxiosInstanceResponse<T>["data"]) => void;
    onError?: (error: AxiosError | T) => void;
}

export type {
    AnyResponseType,
    ApiResponse,
    AxiosInstanceResponse,
    MutationCallbackArgs,
};
