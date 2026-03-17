import { AppError } from "@/utils/http/errorResponses";
import { SaveUserBookSchema, saveUserBookType } from "./userBooks.schema";
import { CreateUserBookInput } from "./userBooks.types";
import { saveUserBook } from "./userBooks.repo";
import { syncDefaultStatusList } from "../user-list-book/userListBook.service";
import { db } from "@/database/db";
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

export const createUserBook = async (
  userBook: saveUserBookType,
  userId: number,
) => {
  return db.$transaction(async (tx) => {
    const normalized = normalizeUserBook(userBook, userId);
    const savedBook = await saveUserBook(tx, normalized);
    await syncDefaultStatusList(tx, userId, savedBook.id, savedBook.status);

    return savedBook;
  });
};
