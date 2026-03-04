import { AppError } from "@/utils/http/errorResponses";
import { getBooksAdapter } from "./adapters";
import { BooksSearchResponseDto } from "./books.dto";
import { SearchBookQuery, searchBookQuerySchema } from "./books.schema";

export const validateSearchQuery = (query: unknown): SearchBookQuery => {
  const parsedQuery = searchBookQuerySchema.safeParse(query);
  if (!parsedQuery.success) throw new AppError("INVALID_QUERY_PARAMETER");

  return parsedQuery.data;
};

export const searchBooks = async (
  query: SearchBookQuery,
): Promise<BooksSearchResponseDto> => {
  const adapter = getBooksAdapter();
  return adapter.search(query);
};
