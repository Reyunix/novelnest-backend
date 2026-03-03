import { BooksSearchResponseDto } from "../books.dto";
import { SearchBookQuery } from "../books.schema";

export interface BooksAdapter {
  search(query: SearchBookQuery): Promise<BooksSearchResponseDto>;
}
