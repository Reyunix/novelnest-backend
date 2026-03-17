import { BookStatus } from "@prisma/client";
import { getUserDefaultLists as getDefaultUserLists } from "../user-lists/userLists.repo";
import { createUserListBook, deleteUserListBook } from "./userListBook.repo";
import { PrismaClient } from "@prisma/client";
import { AppError } from "@/utils/http/errorResponses";
type PrismaDbOrTx = Pick<PrismaClient, "userListBook" | "userList">;

export const syncDefaultStatusList = async (
  tx: PrismaDbOrTx,
  userId: number,
  userBookId: number,
  status: BookStatus,
) => {
  const defaultUserLists = await getDefaultUserLists(tx, userId);
  const newList = defaultUserLists.find((list) => list.name === status);
  if (!newList) throw new AppError("DEFAULT_STATUS_LIST_NOT_FOUND");

  await deleteUserListBook(tx, userBookId, defaultUserLists);
  await createUserListBook(tx, userBookId, newList.id);
};
