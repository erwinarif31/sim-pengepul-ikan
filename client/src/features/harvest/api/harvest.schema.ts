import { z } from "zod";
import createSchema from "../../../utils/createSchema";

const HarvestSchema = z.object({
    id: z.string(),
    harvest_at: z.string(),
    types: z.string(),
    weight: z.coerce.number(),
    price: z.coerce.number(),
    total: z.coerce.number(),
    bagang_name: z.string(),
    owner_name: z.string(),
    worker_name: z.string(),
    created_by_name: z.string(),
    description: z.string().nullable(),
});

const HarvestListSchema = HarvestSchema.array();

const HarvestResponseSchema = {
    list: createSchema(HarvestListSchema),
    detail: createSchema(HarvestSchema),
};

export { HarvestListSchema, HarvestResponseSchema, HarvestSchema };
