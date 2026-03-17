import { DEFAULT_USER_LISTS } from "./userLists.constants";
import { PrismaClient } from "@prisma/client";
type PrismaDbOrTx = Pick<PrismaClient, "userList">;

export const createDefaultUserLists = async (
  prisma: PrismaDbOrTx,
  userId: number,
) => {
  await prisma.userList.createMany({
    skipDuplicates: true,
    data: DEFAULT_USER_LISTS.map((list) => ({
      ...list,
      userId,
    })),
  });
};

export const getUserDefaultLists = async (tx:PrismaDbOrTx, userId: number) => {
  const isDefault = true;
  return await tx.userList.findMany({ where: { userId, isDefault } });
};
