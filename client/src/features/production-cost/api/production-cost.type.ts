import type { z } from "zod";
import type {
    ProductionCostListSchema,
    ProductionCostResponseSchema,
    ProductionCostSchema,
} from "./production-cost.schema";

type ProductionCostProps = z.infer<typeof ProductionCostSchema>;
type ProductionCostList = z.infer<typeof ProductionCostListSchema>;
type ProductionCostResponse = {
    list: z.infer<typeof ProductionCostResponseSchema.list>;
    detail: z.infer<typeof ProductionCostResponseSchema.detail>;
};

export type {
    ProductionCostList,
    ProductionCostProps,
    ProductionCostResponse,
};
