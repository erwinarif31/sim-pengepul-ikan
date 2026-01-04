import type { z } from "zod";
import type {
    BagangListSchema,
    BagangResponseSchema,
    BagangSchema,
} from "./bagang.schema";

type BagangProps = z.infer<typeof BagangSchema>;

type BagangList = z.infer<typeof BagangListSchema>;

type BagangResponse = {
    list: z.infer<typeof BagangResponseSchema.list>;
    detail: z.infer<typeof BagangResponseSchema.detail>;
};

export type { BagangList, BagangProps, BagangResponse };
