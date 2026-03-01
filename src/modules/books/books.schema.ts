import z from "zod";

export const searchBookQuerySchema = z.object({
  q: z.string().min(1, { message: "El parámetro 'q' es requerido y no puede estar vacío" }),
});

export type SearchBookQuery = z.infer<typeof searchBookQuerySchema>;