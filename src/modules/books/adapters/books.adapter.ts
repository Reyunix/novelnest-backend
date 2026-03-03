import { ApiResponse } from "@/schemas/bookApiSchema";
import { SearchBookQuery } from "../books.schema";

export interface BooksAdapter {
  search(query: SearchBookQuery): Promise<ApiResponse>;
}
