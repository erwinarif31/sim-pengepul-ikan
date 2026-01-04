import { z } from "zod";
import createSchema from "../../../utils/createSchema";

const SeasonSchema = z.object({
    id: z.number(),
    start_date: z.string(),
    end_date: z.string(),
});

const SeasonListSchema = SeasonSchema.array();

const SeasonResponseSchema = {
    list: createSchema(SeasonListSchema),
    detail: createSchema(SeasonSchema),
};

export { SeasonListSchema, SeasonResponseSchema, SeasonSchema };