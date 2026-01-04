import { z } from "zod";
import createSchema from "../../../utils/createSchema";

const WorkerSchema = z.object({
    id: z.string(),
    name: z.string(),
});

const WorkerListSchema = WorkerSchema.array();

const WorkerResponseSchema = {
    list: createSchema(WorkerListSchema),
    detail: createSchema(WorkerSchema),
};

export { WorkerListSchema, WorkerResponseSchema, WorkerSchema };
