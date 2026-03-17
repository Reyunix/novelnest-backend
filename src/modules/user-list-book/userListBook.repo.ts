import { PrismaClient, UserList } from "@prisma/client";
type PrismaDbOrTx = Pick<PrismaClient, "userListBook">;

export const deleteUserListBook = async (
  tx: PrismaDbOrTx,
  userBookId: number,
  userLists: UserList[],
) => {
  await tx.userListBook.deleteMany({
    where: {
      userBookId,
      listId: { in: userLists.map((l) => l.id) },
    },
  });
};

export const createUserListBook = async (
  tx: PrismaDbOrTx,
  userBookId: number,
  listId: number,
) => {
  await tx.userListBook.create({
    data: {
      listId,
      userBookId,
    },
  });
};
