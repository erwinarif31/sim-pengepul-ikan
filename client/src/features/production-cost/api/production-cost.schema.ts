import { z } from "zod";
import createSchema from "../../../utils/createSchema";

const ProductionCostSchema = z.object({
    id: z.string(),
    bagang_id: z.string(),
    production_costs_type: z.string(),
    price: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
    created_by: z.string().nullable().optional(),
    created_by_name: z.string().nullable().optional(),
    production_costs_season: z.number(),
    creator_role: z.string().optional(),
});

const ProductionCostListSchema = ProductionCostSchema.array();

const ProductionCostResponseSchema = {
    list: createSchema(ProductionCostListSchema),
    detail: createSchema(ProductionCostSchema),
};

export {
    ProductionCostListSchema,
    ProductionCostResponseSchema,
    ProductionCostSchema,
};
