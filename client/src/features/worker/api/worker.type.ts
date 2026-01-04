import type { z } from "zod";
import type {
    WorkerListSchema,
    WorkerResponseSchema,
    WorkerSchema,
} from "./worker.schema";

type WorkerProps = z.infer<typeof WorkerSchema>;
type WorkerList = z.infer<typeof WorkerListSchema>;
type WorkerResponse = {
    list: z.infer<typeof WorkerResponseSchema.list>;
    detail: z.infer<typeof WorkerResponseSchema.detail>;
};

export type { WorkerList, WorkerProps, WorkerResponse };
