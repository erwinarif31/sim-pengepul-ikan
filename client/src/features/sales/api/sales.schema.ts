import { z } from "zod";
import createSchema from "../../../utils/createSchema";

const SalesSchema = z.object({
    id: z.number(),
    customer: z.string(),
    issued_at: z.string(),
    is_paid_off: z.boolean(),
    paid_off_at: z.string().optional().nullable(),
});

const SalesListSchema = SalesSchema.array();

const SalesResponseSchema = {
    list: createSchema(SalesListSchema),
    detail: createSchema(SalesSchema),
};

export { SalesListSchema, SalesResponseSchema, SalesSchema };