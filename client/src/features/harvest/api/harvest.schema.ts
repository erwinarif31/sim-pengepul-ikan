import { z } from "zod";
import createSchema from "../../../utils/createSchema";

const HarvestSchema = z.object({
    id: z.string(),
    harvest_date: z.string(),
    weight: z.number(),
    price: z.number(),
    bagang_id: z.string(),
    harvest_type: z.string(),
    created_by: z.string().nullable().optional(),
    created_by_name: z.string().nullable().optional(),
    harvests_season: z.number(),
    description: z.string(),
});

const HarvestListSchema = HarvestSchema.array();

const HarvestResponseSchema = {
    list: createSchema(HarvestListSchema),
    detail: createSchema(HarvestSchema),
};

export { HarvestListSchema, HarvestResponseSchema, HarvestSchema };