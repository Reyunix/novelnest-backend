import { DEFAULT_USER_LISTS } from "./userLists.constants";
import { PrismaClient } from "@prisma/client";
import { db } from "@/database/db";
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

export const getUserDefaultLists = async (
  prisma: PrismaDbOrTx,
  userId: number,
) => {
  const isDefault = true;
  return await prisma.userList.findMany({ where: { userId, isDefault } });
};

export const getUserListById = async (id: number, userId: number) => {
  return await db.userList.findFirst({ where: { id, userId } });
};

export const getUserLists = async (userId: number) => {
  return await db.userList.findMany({ where: { userId } });
};
