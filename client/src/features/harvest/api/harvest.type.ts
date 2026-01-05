import type { z } from "zod";
import type {
    HarvestListSchema,
    HarvestResponseSchema,
    HarvestSchema,
} from "./harvest.schema";

type HarvestProps = z.infer<typeof HarvestSchema>;
type HarvestList = z.infer<typeof HarvestListSchema>;
type HarvestResponse = {
    list: z.infer<typeof HarvestResponseSchema.list>;
    detail: z.infer<typeof HarvestResponseSchema.detail>;
};

export type { HarvestList, HarvestProps, HarvestResponse };