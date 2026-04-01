import { AppError } from "@/utils/http/errorResponses";
import {
  DeleteUserBookParamsSchema,
  GetUserBooksQuerySchema,
  SaveUserBookSchema,
  saveUserBookType,
  UpdateBodyUserBookStatusSchema,
  UpdateUserBookStatusParamsSchema,
} from "./userBooks.schema";
import { CreateUserBookInput, userBookStatusData } from "./userBooks.types";
import { saveUserBook, updateUserBookStatus } from "./userBooks.repo";
import { syncDefaultStatusList } from "../user-list-book/userListBook.service";
import { db } from "@/database/db";

export const validateSaveUserBook = (rawData: unknown) => {
  const parsed = SaveUserBookSchema.safeParse(rawData);
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
    const id = savedBook.id;
    const status = savedBook.status;
    await syncDefaultStatusList(tx, { id, userId, status });

    return savedBook;
  });
};

export const validateParamsDeleteUserBook = (rawData: unknown) => {
  const parsed = DeleteUserBookParamsSchema.safeParse(rawData);
  if (!parsed.success) throw new AppError("INVALID_USERBOOK_PARAMS");
  return parsed;
};

export const validateBodyUpdateUserBookStatus = (rawData: unknown) => {
  const parsed = UpdateBodyUserBookStatusSchema.safeParse(rawData);
  if (!parsed.success) throw new AppError("INVALID_UPDATE_USERBOOK_BODY");
  return parsed;
};

export const validateParamsUpdateUserBookStatus = (rawdata: unknown) => {
  const parsed = UpdateUserBookStatusParamsSchema.safeParse(rawdata);
  if (!parsed.success) throw new AppError("INVALID_USERBOOK_PARAMS");
  return parsed;
};

export const UpdateAndSyncUserBookStatus = ({
  userId,
  id,
  status,
}: userBookStatusData) => {
  return db.$transaction(async (tx) => {
    const updatedBook = await updateUserBookStatus(tx, { userId, id, status });
    await syncDefaultStatusList(tx, {id, userId, status});
    return updatedBook
  });
};


export const validateGetUserBooksQuery = (rawData: unknown) => {
  const parsed = GetUserBooksQuerySchema.safeParse(rawData);
  if (!parsed.success) throw new AppError("INVALID_GET_USERBOOKS_PARAMS");
  return parsed.data.status;
}