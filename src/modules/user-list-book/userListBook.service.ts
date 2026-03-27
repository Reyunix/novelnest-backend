import { BookStatus } from "@prisma/client";
import { getUserDefaultLists as getDefaultUserLists } from "../user-lists/userLists.repo";
import { createUserListBook, deleteUserListBook } from "./userListBook.repo";
import { PrismaClient } from "@prisma/client";
import { AppError } from "@/utils/http/errorResponses";
import { userBookStatusData } from "../user-books/userBooks.types";
type PrismaDbOrTx = Pick<PrismaClient, "userListBook" | "userList">;

export const syncDefaultStatusList = async (
  tx: PrismaDbOrTx,
  {id, userId, status}: userBookStatusData
) => {
  const defaultUserLists = await getDefaultUserLists(tx, userId);
  const newList = defaultUserLists.find((list) => list.name === status);
  if (!newList) throw new AppError("DEFAULT_STATUS_LIST_NOT_FOUND");

  await deleteUserListBook(tx, id, defaultUserLists);
  await createUserListBook(tx, id, newList.id);
};
