import type { z } from "zod";
import type {
    ProductionCostTypeListSchema,
    ProductionCostTypeResponseSchema,
    ProductionCostTypeSchema,
} from "./production-cost-type.schema";

type ProductionCostTypeProps = z.infer<typeof ProductionCostTypeSchema>;
type ProductionCostTypeList = z.infer<typeof ProductionCostTypeListSchema>;
type ProductionCostTypeResponse = {
    list: z.infer<typeof ProductionCostTypeResponseSchema.list>;
    detail: z.infer<typeof ProductionCostTypeResponseSchema.detail>;
};

export type {
    ProductionCostTypeList,
    ProductionCostTypeProps,
    ProductionCostTypeResponse,
};
