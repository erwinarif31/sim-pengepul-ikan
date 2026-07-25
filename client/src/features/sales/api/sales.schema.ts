import { z } from "zod";
import createSchema from "../../../utils/createSchema";

const SalesSchema = z.object({
    id: z.number(),
    customer: z.string(),
    issued_at: z.string(),
    is_paid_off: z.boolean(),
    paid_off_at: z.string().optional().nullable(),
    payments_visible: z.boolean(),
    sales_details: z.array(
        z.object({
            id: z.number(),
            sales_id: z.number(),
            bagang_id: z.string().optional().nullable(),
            bagang_name: z.string(),
            harvest_types: z.string(),
            weight: z.number(),
            price: z.number(),
            subtotal: z.number(),
        }),
    ).optional(),
    transaction_details: z.array(
        z.object({
            id: z.number(),
            sales_id: z.number(),
            amount: z.number(),
            paid_at: z.string(),
        }),
    ).optional(),
    total_amount: z.number().optional(),
    total_paid: z.number().optional(),
});

const SalesListSchema = SalesSchema.array();

const SalesResponseSchema = {
    list: createSchema(SalesListSchema),
    detail: createSchema(SalesSchema),
};

export { SalesListSchema, SalesResponseSchema, SalesSchema };
