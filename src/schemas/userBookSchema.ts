import { z } from "zod";

const  UserBookStatus = ["reading","completed","abandoned","want_to_read"] as const;
export type UserBookStatus = typeof UserBookStatus[number];

// Post request schema for creating a user book entry
const CreateUserBookSchema = z.object({
    provider: z.string().min(1),
    providerBookId: z.string().min(1),
    title: z.string().trim().min(1),
    status: z.enum(UserBookStatus).optional().default("want_to_read"),
    authors: z.array(z.string()).optional().default([]),
    thumbnail: z.url().optional(),
    canonicalVolumeLink: z.url().optional(),
    rating: z.int().min(0).max(5).optional(),
    review: z.string().trim().min(1).optional(),
    startedAt: z.coerce.date().optional(),
    finishedAt: z.coerce.date().optional(),
});
export type CreateUserBookData = z.infer<typeof CreateUserBookSchema>;
export { CreateUserBookSchema, UserBookStatus };

// Patch request schema for updating a user book entry
const UpdateUserBookSchema = z.object({
    status: z.enum(UserBookStatus).optional(),
    rating: z.int().min(0).max(5).optional(),
    review: z.string().trim().min(1).optional(),
    startedAt: z.coerce.date().optional(),
    finishedAt: z.coerce.date().optional(),
});
export type UpdateUserBookData = z.infer<typeof UpdateUserBookSchema>;
export { UpdateUserBookSchema };

// Schema for validating the userBookId path parameter
const UserBookIdParamSchema = z.object({
    entryId: z.coerce.number().int().positive(),
});
export type UserBookIdParam = z.infer<typeof UserBookIdParamSchema>;
export { UserBookIdParamSchema };