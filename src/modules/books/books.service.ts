import { ApiResponse } from "@/schemas/bookApiSchema";
import { AppError } from "@/utils/http/errorResponses";
import { SearchBookQuery, searchBookQuerySchema } from "./books.schema";
import { getBooksAdapter } from "./adapters";

export const validateSearchQuery = (query: unknown): SearchBookQuery => {
  const parsedQuery = searchBookQuerySchema.safeParse(query);

  if (!parsedQuery.success) {
    throw new AppError("INVALID_QUERY_PARAMETER");
  }

  return parsedQuery.data;
};

export const searchBooks = async (
  query: SearchBookQuery,
): Promise<ApiResponse> => {
  const adapter = getBooksAdapter();
  return adapter.search(query);
};
