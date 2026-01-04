import { z } from "zod";
import type { AxiosError } from "axios";
import createSchema from "../utils/createSchema";

const AxiosResponseSchema = z.object({
    data: z.any(),
    status: z.number(),
    headers: z.record(z.string(), z.any()).optional(),
});

const AnyResponseSchema = createSchema(z.any());

type AxiosResponseType = z.infer<typeof AxiosResponseSchema>;

type AnyResponseType = z.infer<typeof AnyResponseSchema>;

interface AxiosInstanceResponse<T = AnyResponseType> extends AxiosResponseType {
    data: T;
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

