import type { z } from "zod";
import type {
    SeasonListSchema,
    SeasonResponseSchema,
    SeasonSchema,
} from "./season.schema";

type SeasonProps = z.infer<typeof SeasonSchema>;
type SeasonList = z.infer<typeof SeasonListSchema>;
type SeasonResponse = {
    list: z.infer<typeof SeasonResponseSchema.list>;
    detail: z.infer<typeof SeasonResponseSchema.detail>;
};

export type { SeasonList, SeasonProps, SeasonResponse };