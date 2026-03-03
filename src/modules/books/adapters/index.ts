import { AppError } from "@/utils/http/errorResponses";
import { BooksAdapter } from "./books.adapter";
import { GoogleBooksAdapter } from "./googleBooks.adapter";

const googleBooksAdapter = new GoogleBooksAdapter();

export const getBooksAdapter = (): BooksAdapter => {
  // Keep provider selection centralized for future migrations.
  const provider = process.env.API_BOOKS_PROVIDER?.toLowerCase() ?? "google";

  switch (provider) {
    case "google":
      return googleBooksAdapter;
    default:
      throw new AppError("INVALID_BOOKS_PROVIDER");
  }
};
