import { z } from "zod";
import createSchema from "../../../utils/createSchema";

const SeasonSchema = z.object({
    id: z.string(),
    name: z.string(),
    is_active: z.boolean(),
    updated_at: z.string(),
    created_at: z.string(),
    worker_id: z.string(),
    worker_name: z.string(),
    owner_id: z.string(),
    owner_name: z.string(),
});

const SeasonListSchema = SeasonSchema.array();

const SeasonResponseSchema = {
    list: createSchema(SeasonListSchema),
    detail: createSchema(SeasonSchema),
};

export { SeasonSchema, SeasonResponseSchema, SeasonListSchema };
