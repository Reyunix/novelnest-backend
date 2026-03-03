import { z } from "zod";

export const BooksSearchItemDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  publisher: z.string().nullable(),
  publishedDate: z.string().nullable(),
  pageCount: z.number().nullable(),
  categories: z.array(z.string()),
  maturityRating: z.string().nullable(),
  thumbnail: z.string().nullable(),
  canonicalVolumeLink: z.string().nullable(),
  description: z.string().nullable(),
  language: z.string().nullable(),
});

export const BooksSearchResponseDtoSchema = z.object({
  provider: z.string(),
  totalItems: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  items: z.array(BooksSearchItemDtoSchema),
});

export type BooksSearchItemDto = z.infer<typeof BooksSearchItemDtoSchema>;
export type BooksSearchResponseDto = z.infer<typeof BooksSearchResponseDtoSchema>;
