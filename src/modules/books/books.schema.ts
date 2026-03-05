import z from "zod";

const nonEmptyString = z.string().trim().min(1);

export const searchBookQuerySchema = z
  .object({
    all: nonEmptyString.optional(),
    title: nonEmptyString.optional(),
    author: nonEmptyString.optional(),
    subject: nonEmptyString.optional(),
    isbn: nonEmptyString.optional(),
    sortBy: z.enum(["relevance", "newest"]).default("relevance"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(40).default(40),
    printType: z.enum(["all", "books", "magazines"]).default("books"),
    availability: z
      .enum(["partial", "full", "free-ebooks", "paid-ebooks", "ebooks"])
      .optional(),
    download: z.enum(["epub"]).optional(),
    projection: z.enum(["full", "lite"]).optional(),
  })
  .superRefine((value, ctx) => {
    const hasSearchTerm = Boolean(
      value.all || value.title || value.author || value.subject || value.isbn,
    );

    if (!hasSearchTerm) {
      ctx.addIssue({
        code: "custom",
        path: ["all"],
        message:
          "At least one search parameter is required: all, title, author, subject, or isbn",
      });
    }
  });

export type SearchBookQuery = z.infer<typeof searchBookQuerySchema>;
