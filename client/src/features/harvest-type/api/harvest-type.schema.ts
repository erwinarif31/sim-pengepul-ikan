import { z } from "zod";
import createSchema from "../../../utils/createSchema";

const HarvestTypeSchema = z.object({
    name: z.string(),
});

const HarvestTypeListSchema = HarvestTypeSchema.array();

const HarvestTypeResponseSchema = {
    list: createSchema(HarvestTypeListSchema),
    detail: createSchema(HarvestTypeSchema),
};

export { HarvestTypeListSchema, HarvestTypeResponseSchema, HarvestTypeSchema };
