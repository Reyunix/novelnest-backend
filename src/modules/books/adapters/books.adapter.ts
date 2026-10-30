import { BooksSearchResponseDto, BookDetailDto } from "../books.dto";
import { SearchBookQuery } from "../books.schema";

export interface BooksAdapter {
  getById(providerBookId: string): Promise<BookDetailDto>;
  search(query: SearchBookQuery): Promise<BooksSearchResponseDto>;
}
