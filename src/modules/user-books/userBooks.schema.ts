import { z } from "zod";

const nonEmptyString = z.string().nonempty();
const positiveNumber = z.coerce.number().int().positive();

export const UserBookStatus = [
  "reading",
  "completed",
  "abandoned",
  "want_to_read",
] as const;
export type UserBookStatus = (typeof UserBookStatus)[number];

export const SaveUserBookSchema = z.object({
  provider: nonEmptyString,
  providerBookId: nonEmptyString,
  title: nonEmptyString,
  status: z.enum(UserBookStatus).default("want_to_read"),
  authors: z.array(nonEmptyString).default([]),
  thumbnail: z.url().optional().nullable(),
  canonicalVolumeLink: z.url().optional().nullable(),
});

export type saveUserBookType = z.infer<typeof SaveUserBookSchema>;

// (Patch http) request schema for updating a user book entry
export const UpdateUserBookSchema = z
  .object({
    status: z.enum(UserBookStatus).optional(),
    rating: z.int().min(0).max(5).optional(),
    review: nonEmptyString.optional(),
    startedAt: z.coerce.date().optional(),
    finishedAt: z.coerce.date().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "Se debe definir por lo menor un campo",
  });
export type UpdateUserBookData = z.infer<typeof UpdateUserBookSchema>;

export const UpdateBodyUserBookStatusSchema = z.object({
  status: z.enum(UserBookStatus),
});

export const UpdateUserBookStatusParamsSchema = z.object({
  bookId: positiveNumber,
});

export type UserBookStatusParam = z.infer<
  typeof UpdateUserBookStatusParamsSchema
>;

// Schema for validating the userBookId path parameter
export const UserBookIdParamSchema = z.object({
  entryId: positiveNumber,
});
export type UserBookIdParam = z.infer<typeof UserBookIdParamSchema>;

export const DeleteUserBookParamsSchema = z.object({
  bookId: positiveNumber,
});
