import type { z } from "zod";
import type {
    SalesListSchema,
    SalesResponseSchema,
    SalesSchema,
} from "./sales.schema";

type SalesProps = z.infer<typeof SalesSchema>;

type SalesList = z.infer<typeof SalesListSchema>;

type SalesResponse = {
    list: z.infer<typeof SalesResponseSchema.list>;
    detail: z.infer<typeof SalesResponseSchema.detail>;
};

export type { SalesList, SalesProps, SalesResponse };
