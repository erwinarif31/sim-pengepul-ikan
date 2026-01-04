import { z } from "zod";
import createSchema from "../../../utils/createSchema";

const ProductionCostTypeSchema = z.object({
    name: z.string(),
});

const ProductionCostTypeListSchema = ProductionCostTypeSchema.array();

const ProductionCostTypeResponseSchema = {
    list: createSchema(ProductionCostTypeListSchema),
    detail: createSchema(ProductionCostTypeSchema),
};

export {
    ProductionCostTypeListSchema,
    ProductionCostTypeResponseSchema,
    ProductionCostTypeSchema,
};
