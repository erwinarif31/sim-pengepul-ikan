import type { z } from "zod";
import type {
    SeasonSchema,
    SeasonResponseSchema,
    SeasonListSchema,
} from "./season.schema";

type SeasonProps = z.infer<typeof SeasonSchema>;

type SeasonList = z.infer<typeof SeasonListSchema>;

type SeasonResponse = {
    list: z.infer<typeof SeasonResponseSchema.list>;
    detail: z.infer<typeof SeasonResponseSchema.detail>;
};

export type { SeasonProps, SeasonList, SeasonResponse };
