import { z } from "zod";

export const bookParamsSchema = z.object({
  provider: z.literal("google"),
  providerBookId: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-zA-Z0-9_-]+$/),
});
export const communityQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(1000000).default(1),
  limit: z.coerce.number().int().min(1).max(40).default(10),
});
export const reviewInputSchema = z
  .object({
    rating: z.number().int().min(1).max(5).nullable().default(null),
    text: z
      .string()
      .trim()
      .max(5000)
      .nullable()
      .default(null)
      .transform((value) => value || null),
  })
  .strict()
  .refine((value) => value.rating !== null || value.text !== null);
export type BookIdentity = z.infer<typeof bookParamsSchema>;

export const reviewDtoSchema = z.object({
  id: z.number().int().positive(),
  rating: z.number().int().min(1).max(5).nullable(),
  text: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  user: z.object({ name: z.string() }),
});
export const communityDtoSchema = z.object({
  average: z.number().min(1).max(5).nullable(),
  ratingsCount: z.number().int().nonnegative(),
  totalItems: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().positive(),
  items: z.array(reviewDtoSchema),
});
