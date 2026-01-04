import { z } from "zod";

/**
 * Membuat schema untuk response dari API.
 * @param dataSchema Schema dari data yang akan diterima
 * @returns Schema untuk response dari API
 * @example createSchema(z.object({ id: z.string() }))
 */
function createSchema<ItemType extends z.ZodTypeAny>(dataSchema: ItemType) {
    return z.object({
        status: z.enum(["success", "failed"]),
        data: dataSchema,
    });
}

export default createSchema;
