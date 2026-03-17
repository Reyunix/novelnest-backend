import z from "zod";

export const UserListParamsSchema = z.object({
    listId: z.coerce.number().int().positive()
})