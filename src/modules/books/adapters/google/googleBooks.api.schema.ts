import { z } from "zod";

const GoogleBooksImageLinksSchema = z.object({
  smallThumbnail: z.string().optional(),
  thumbnail: z.string().optional(),
  medium: z.string().optional(),
  large: z.string().optional(),
});

const GoogleBooksIndustryIdentifierSchema = z.object({
  type: z.string().optional(),
  identifier: z.string().optional(),
});

const GoogleBooksVolumeInfoSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  averageRating: z.number().min(0).max(5).optional(),
  ratingsCount: z.number().int().nonnegative().optional(),
  previewLink: z.string().optional(),
  authors: z.array(z.string()).optional(),
  publisher: z.string().optional(),
  publishedDate: z.string().optional(),
  pageCount: z.number().optional(),
  categories: z.array(z.string()).optional(),
  maturityRating: z.string().optional(),
  imageLinks: GoogleBooksImageLinksSchema.optional(),
  language: z.string().optional(),
  canonicalVolumeLink: z.string().optional(),
  description: z.string().optional(),
  industryIdentifiers: z.array(GoogleBooksIndustryIdentifierSchema).optional(),
});

export const GoogleBooksVolumeItemSchema = z.object({
  id: z.string(),
  volumeInfo: GoogleBooksVolumeInfoSchema.optional(),
});

export const GoogleBooksApiResponseSchema = z.object({
  kind: z.string().optional(),
  totalItems: z.number().optional(),
  items: z.array(GoogleBooksVolumeItemSchema).optional(),
});

export type GoogleBooksVolumeItem = z.infer<typeof GoogleBooksVolumeItemSchema>;
export type GoogleBooksApiResponse = z.infer<
  typeof GoogleBooksApiResponseSchema
>;
