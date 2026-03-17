import { z } from "zod";
const nonEmptyString = z.string().trim().min(1);
const  UserBookStatus = ["reading","completed","abandoned","want_to_read"] as const;
export type UserBookStatus = typeof UserBookStatus[number];

const SaveUserBookSchema = z.object({
    provider: nonEmptyString,
    providerBookId: nonEmptyString,
    //list: nonEmptyString.default("default"),
    title: nonEmptyString,
    status: z.enum(UserBookStatus).default("want_to_read"),
    authors: z.array(nonEmptyString).default([]),
    thumbnail: z.url().optional().nullable(),
    canonicalVolumeLink: z.url().optional().nullable(),
})

export type saveUserBookType = z.infer<typeof SaveUserBookSchema>
export { SaveUserBookSchema, UserBookStatus };

// (Patch http) request schema for updating a user book entry
const UpdateUserBookSchema = z.object({
    status: z.enum(UserBookStatus).optional(),
    rating: z.int().min(0).max(5).optional(),
    review: nonEmptyString.optional(),
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