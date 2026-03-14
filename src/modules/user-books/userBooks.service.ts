import { AppError } from "@/utils/http/errorResponses";
import { SaveUserBookSchema, saveUserBookType } from "./userBooks.schema";
import { CreateUserBookInput } from "./userBooks.types";

export const validateSaveUserBook = (userBook: unknown) => {
  const parsed = SaveUserBookSchema.safeParse(userBook);
  if (!parsed.success) throw new AppError("INVALID_SAVE_USERBOOK_DATA");

  return parsed.data;
};

export const normalizeUserBook = (
  book: saveUserBookType,
  userId: number,
): CreateUserBookInput => {
  return {
    ...book,
    userId,
  };
};
