import type { z } from "zod";
import type {
    HarvestTypeListSchema,
    HarvestTypeResponseSchema,
    HarvestTypeSchema,
} from "./harvest-type.schema";

type HarvestTypeProps = z.infer<typeof HarvestTypeSchema>;
type HarvestTypeList = z.infer<typeof HarvestTypeListSchema>;
type HarvestTypeResponse = {
    list: z.infer<typeof HarvestTypeResponseSchema.list>;
    detail: z.infer<typeof HarvestTypeResponseSchema.detail>;
};

export type { HarvestTypeList, HarvestTypeProps, HarvestTypeResponse };
