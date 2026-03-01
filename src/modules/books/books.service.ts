import { FormatUrl } from "@/utils/FormatUrl";
import { AppError } from "@/utils/http/errorResponses";
import { searchBookQuerySchema } from "./books.schema";
import { ApiResponse } from "@/schemas/bookApiSchema";

export const validateQuery = (q: string) => {    
    const parsedQuery = searchBookQuerySchema.safeParse({ q });
    if (!parsedQuery.success) {
        throw new AppError("INVALID_QUERY_PARAMETER");
    }
    const query = encodeURIComponent(parsedQuery.data.q.trim());
    return FormatUrl(query);}

export const fetchBooks = async (query: string) => {
    const response = await fetch(query);
    if (!response.ok) {
      throw new AppError("EXTERNAL_API_ERROR");
    } else {
      const data = await response.json() as ApiResponse;
      return data;
    }
}