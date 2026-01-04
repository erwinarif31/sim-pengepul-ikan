import { z } from "zod";
import createSchema from "../../../utils/createSchema";

const BagangSchema = z.object({
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

const BagangListSchema = BagangSchema.array();

const BagangResponseSchema = {
    list: createSchema(BagangListSchema),
    detail: createSchema(BagangSchema),
};

export { BagangListSchema, BagangResponseSchema, BagangSchema };
